# The Safety Diver

> **The Knowledge Purification Plant for AI Agents**

AI agents are only as good as the knowledge they swim in. The Safety Diver sits between your raw documents and your AI knowledge base — scanning for pollution, surfacing contradictions, and scoring every result for trustworthiness before your agent consumes it.

Built for the **Human Delta** sponsor track.

---

## The Problem

AI agents that retrieve and reason over documents inherit every flaw in that knowledge base:

- **PII leaks** — employee SSNs, credit cards, and API keys accidentally indexed alongside your product docs
- **Contradictions** — version 1 of your refund policy says 30 days, version 2 says 7 days — your agent has no idea which to trust
- **Blind trust** — every search result looks equally valid with no signal for how relevant or clean the source actually is

---

## The Solution

Three core features that act as a purification layer before knowledge reaches your AI:

### Purified Ingestion
Every document passes through a pollution scanner before it touches the index. PII, secrets, and API keys are detected, redacted in the report, and blocked at the gate if the contamination is severe enough.

- Drag-and-drop files or paste a URL to crawl a website
- Real-time Water Clarity scan on every upload
- **Clean** → forwarded to the knowledge base
- **Murky** → forwarded with a warning report
- **Toxic** → blocked entirely, never reaches the index

### The Auditor — Diver Mode
Type any topic and the diver goes deep into your knowledge base looking for conflicting information across documents. Contradictions surface as side-by-side diffs so you can see exactly where your knowledge base is lying to itself.

- Powered by vector similarity search across all indexed documents
- Groups results by source document, then compares them pairwise
- Detects both fully divergent sources and near-duplicate documents with subtle factual differences
- **Mark as Canonical** on any contradiction to declare the authoritative source
- Perfect for detecting outdated policies, conflicting specs, or version drift

### Governance Log
Every canonical declaration is written to Human Delta's agent filesystem at `/agent/canonical-sources.md`. The Governance Log page shows all active declarations — which source is trusted, which is rejected, and for what term. Declarations can be deleted if a decision needs to be reversed.

### Clarity Dashboard
Search your knowledge base and get back not just results — but a **Water Clarity Score** for every one, plus governance badges showing whether a source has been declared canonical or rejected. Know how much to trust each source before your agent consumes it.

| Score | Label | Meaning |
|---|---|---|
| 80 – 100 | Crystal | Highly relevant, clean source |
| 60 – 79 | Clear | Relevant, minimal concerns |
| 40 – 59 | Murky | Low relevance or questionable source |
| < 40 | Toxic | Poor match or contaminated source |

---

## Water Clarity Levels

The Safety Diver uses a water metaphor throughout — because knowledge quality is exactly like water quality.

| Level | Color | Trigger |
|---|---|---|
| Clean | Cyan | No PII or secrets found |
| Murky | Amber | 1–2 PII matches, no secrets |
| Toxic | Red | 3+ matches or any secret key (API key, AWS key) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Rust, Axum, Tokio, Serde |
| Knowledge Layer | Human Delta (vector storage + semantic search) |
| PII Scanner | Custom regex engine (SSN, email, credit card, phone, API keys, AWS keys) |

The Rust backend is the **Safety Valve** — nothing reaches Human Delta without passing through it first.

---

## Pollution Detection

The scanner catches:

- Social Security Numbers
- Email addresses
- Credit card numbers
- Phone numbers
- Generic API keys and secret tokens
- AWS access key IDs

All matches are **redacted** in reports — the raw sensitive value is never exposed, only a masked snippet like `***-**-6789` or `b***@company.com`.

---

## Demo Flow

1. **Ingest** an employee records file → watch the Toxic Water overlay trigger, document blocked
2. **Ingest** a refund policy document → Murky pass-through with email flagged
3. **Audit** "refund policy" → contradictions surface between v1 (30-day) and v2 (7-day)
4. **Mark as Canonical** → v2 is declared the source of truth, written to `/agent/canonical-sources.md`
5. **Governance Log** → declaration appears with canonical and rejected sources listed
6. **Search** "refund policy" → v2 shows a green Canonical badge, v1 shows a dimmed Rejected badge

---

*Built in 32 hours at a hackathon. Every document that enters your knowledge base should be this clean.*
