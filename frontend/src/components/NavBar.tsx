"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Waves, Upload, ScanSearch, LayoutDashboard, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const links = [
  { href: "/ingest",     label: "Upload",     icon: Upload },
  { href: "/audit",      label: "Audit",      icon: ScanSearch },
  { href: "/search",     label: "Search",     icon: LayoutDashboard },
  { href: "/governance", label: "Governance", icon: ShieldCheck },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 glass border-b border-surface/40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <motion.div
            animate={{ rotate: [0, 12, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Waves className="h-5 w-5 text-flow" />
          </motion.div>
          <span className="font-bold text-base tracking-tight text-foam group-hover:text-flow transition-colors duration-200">
            The Safety Diver
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`
                  relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${active
                    ? "text-flow"
                    : "text-foam/50 hover:text-foam/90 hover:bg-foam/5"
                  }
                `}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl bg-flow/10 border border-flow/25"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="relative h-4 w-4" />
                <span className="relative">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
