import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "SahayakAI — AI Crisis Co-Pilot for Hospitality",
  description:
    "Full-lifecycle AI crisis response for hotels. BEFORE (crowd risk) / DURING (multilingual SOS) / AFTER (auto reports). Powered by Gemini + Firebase.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen">
        <nav className="no-print sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500 sos-pulse" />
              SahayakAI
            </Link>
            <div className="flex items-center gap-6 text-sm text-zinc-300">
              <Link href="/sos" className="hover:text-white">Guest SOS</Link>
              <Link href="/staff" className="hover:text-white">Staff Dashboard</Link>
              <Link href="/heatmap" className="hover:text-white">Crowd Heatmap</Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="no-print mx-auto max-w-6xl px-6 py-10 text-center text-xs text-zinc-500">
          SahayakAI • Google Solution Challenge 2026 • Team Moni Pachori •
          Powered by Gemini 1.5 Flash + Firebase
        </footer>
      </body>
    </html>
  );
}
