use std::sync::LazyLock;

use regex::Regex;

use crate::models::{PatternType, PollutionMatch, PollutionReport, Severity};

struct Rule {
    kind: PatternType,
    re: Regex,
}

static RULES: LazyLock<Vec<Rule>> = LazyLock::new(|| {
    vec![
        Rule {
            kind: PatternType::Ssn,
            // XXX-XX-XXXX with word boundaries
            re: Regex::new(r"\b\d{3}-\d{2}-\d{4}\b").unwrap(),
        },
        Rule {
            kind: PatternType::Email,
            re: Regex::new(r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b").unwrap(),
        },
        Rule {
            kind: PatternType::CreditCard,
            // 16-digit groups separated by spaces or dashes
            re: Regex::new(r"\b(?:\d{4}[-\s]){3}\d{4}\b").unwrap(),
        },
        Rule {
            kind: PatternType::Phone,
            // (555) 867-5309 / 555-867-5309 / +1.555.867.5309
            // No leading \b — it blocks matching when number starts with '('
            re: Regex::new(
                r"(?:\+?1[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]\d{3}[-.\s]\d{4}\b",
            )
            .unwrap(),
        },
        Rule {
            kind: PatternType::AwsKey,
            // AWS access key IDs always start with AKIA
            re: Regex::new(r"\bAKIA[0-9A-Z]{16}\b").unwrap(),
        },
        Rule {
            kind: PatternType::ApiKey,
            // key=<value> / token: <value> / secret=<value> patterns
            re: Regex::new(
                r#"(?i)(?:api[_\-]?key|api[_\-]?token|secret[_\-]?key|access[_\-]?token|auth[_\-]?token)\s*[=:]\s*[\w\-\.]{20,}"#,
            )
            .unwrap(),
        },
    ]
});

/// Scan `content` for PII and secrets. Pure function — no I/O.
pub fn scan(content: &str) -> PollutionReport {
    let mut matches: Vec<PollutionMatch> = Vec::new();

    for rule in RULES.iter() {
        for m in rule.re.find_iter(content) {
            matches.push(PollutionMatch {
                pattern_type: rule.kind.clone(),
                snippet: redact(m.as_str(), &rule.kind),
                char_offset: m.start(),
            });
        }
    }

    // Sort by position in document so the UI can render them in order
    matches.sort_by_key(|m| m.char_offset);

    let severity = compute_severity(&matches);
    let match_count = matches.len();
    PollutionReport { matches, severity, match_count }
}

fn redact(raw: &str, kind: &PatternType) -> String {
    match kind {
        PatternType::Ssn => {
            // Keep last 4 digits: XXX-XX-1234
            let last4 = &raw[raw.len().saturating_sub(4)..];
            format!("***-**-{last4}")
        }
        PatternType::Email => {
            // user@domain → u***@domain
            if let Some(at) = raw.find('@') {
                let domain = &raw[at + 1..];
                let first = raw.chars().next().unwrap_or('*');
                format!("{first}***@{domain}")
            } else {
                "[email redacted]".to_string()
            }
        }
        PatternType::CreditCard => {
            // Keep last 4 digits
            let digits: String = raw.chars().filter(|c| c.is_ascii_digit()).collect();
            let last4 = &digits[digits.len().saturating_sub(4)..];
            format!("****-****-****-{last4}")
        }
        PatternType::Phone => "***-***-****".to_string(),
        PatternType::ApiKey | PatternType::AwsKey => {
            // Show the key name but redact the value
            let sep_pos = raw.find(|c| c == '=' || c == ':').unwrap_or(raw.len() - 1);
            let key_name = raw[..sep_pos].trim();
            format!("{key_name}=[REDACTED]")
        }
    }
}

fn compute_severity(matches: &[PollutionMatch]) -> Severity {
    let has_secret = matches.iter().any(|m| m.pattern_type.is_secret());
    if has_secret || matches.len() >= 3 {
        Severity::Toxic
    } else if !matches.is_empty() {
        Severity::Murky
    } else {
        Severity::Clean
    }
}

// ── Unit tests ────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::Severity;

    #[test]
    fn clean_text_is_clean() {
        let report = scan("This document contains no sensitive information whatsoever.");
        assert_eq!(report.severity, Severity::Clean);
        assert_eq!(report.match_count, 0);
    }

    #[test]
    fn detects_ssn() {
        let report = scan("Employee SSN: 123-45-6789");
        assert_eq!(report.severity, Severity::Murky);
        assert_eq!(report.match_count, 1);
        assert_eq!(report.matches[0].pattern_type, PatternType::Ssn);
        assert!(report.matches[0].snippet.contains("***-**-"));
        assert!(report.matches[0].snippet.ends_with("6789"));
    }

    #[test]
    fn detects_email() {
        let report = scan("Contact support@example.com for help.");
        assert_eq!(report.severity, Severity::Murky);
        assert!(report.matches.iter().any(|m| m.pattern_type == PatternType::Email));
    }

    #[test]
    fn detects_credit_card() {
        let report = scan("Card: 4111 1111 1111 1111 was charged.");
        assert!(report.matches.iter().any(|m| m.pattern_type == PatternType::CreditCard));
        let card_match = report.matches.iter().find(|m| m.pattern_type == PatternType::CreditCard).unwrap();
        assert!(card_match.snippet.ends_with("1111"));
    }

    #[test]
    fn detects_phone() {
        let report = scan("Call us at (555) 867-5309 anytime.");
        assert!(report.matches.iter().any(|m| m.pattern_type == PatternType::Phone));
    }

    #[test]
    fn aws_key_forces_toxic() {
        let report = scan("key=AKIAIOSFODNN7EXAMPLE is the AWS ID");
        assert_eq!(report.severity, Severity::Toxic);
        assert!(report.matches.iter().any(|m| m.pattern_type == PatternType::AwsKey));
    }

    #[test]
    fn api_key_forces_toxic() {
        let report = scan("api_key=sk-abcdefghijklmnopqrstuvwxyz123456789");
        assert_eq!(report.severity, Severity::Toxic);
        assert!(report.matches.iter().any(|m| m.pattern_type == PatternType::ApiKey));
    }

    #[test]
    fn three_pii_matches_forces_toxic() {
        let report = scan(
            "SSN: 123-45-6789, email: bob@corp.com, phone: 555-123-4567, another: 555-987-6543",
        );
        assert_eq!(report.severity, Severity::Toxic);
        assert!(report.match_count >= 3);
    }

    #[test]
    fn two_pii_matches_is_murky() {
        let report = scan("SSN: 123-45-6789 and email: bob@corp.com");
        assert_eq!(report.severity, Severity::Murky);
        assert_eq!(report.match_count, 2);
    }

    #[test]
    fn redaction_never_exposes_full_ssn() {
        let report = scan("SSN: 123-45-6789");
        let snippet = &report.matches[0].snippet;
        assert!(!snippet.contains("123-45"), "SSN prefix must be redacted");
    }

    #[test]
    fn redaction_never_exposes_full_card() {
        let report = scan("4111 1111 1111 1111");
        let snippet = &report.matches[0].snippet;
        assert!(!snippet.contains("4111 1111 1111"), "Card prefix must be redacted");
    }
}
