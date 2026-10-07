"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import "@/index.css";

const LINKS = [
  { href: "/chat", label: "Chat" },
  { href: "/library", label: "Document library" },
];

const linkClass = (isActive: boolean) =>
  [
    "block rounded-[var(--brand-radius)] px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "bg-[var(--brand-hover)] text-[var(--brand-fg)]" : "text-[var(--brand-fg-muted)]",
  ].join(" ");

// `trailingSlash` is on for the static export, so the browser is at `/orders/`
// while the link says `/orders`. Comparing them raw would leave every link
// inactive.
const samePath = (a: string, b: string) =>
  (a.replace(/\/+$/, "") || "/") === (b.replace(/\/+$/, "") || "/");

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <html lang="en">
      <body>
        <title>{"Simple RAG chatbot web app"}</title>
        <div className="flex min-h-screen">
          <aside
            className="w-56 shrink-0 border-r p-4"
            style={{
              backgroundColor: "var(--brand-surface)",
              borderColor: "var(--brand-border)",
            }}
          >
            <p
              className="mb-4 px-3 text-sm font-semibold"
              style={{ fontFamily: "var(--brand-font-heading)" }}
            >
              {"Simple RAG chatbot web app"}
            </p>
            <nav className="flex flex-col gap-1">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={linkClass(samePath(pathname, link.href))}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
