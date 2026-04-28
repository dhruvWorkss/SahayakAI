import Link from "next/link";

const tiles = [
  {
    href: "/sos",
    phase: "DURING",
    title: "Guest SOS",
    blurb: "1-tap emergency in 12 Indian languages. Gemini classifies type + severity in <2 sec.",
    cta: "Trigger an SOS →",
    accent: "from-red-500/20 to-red-500/5 border-red-500/40",
  },
  {
    href: "/staff",
    phase: "DURING",
    title: "Staff Dashboard",
    blurb: "Real-time incident feed with AI-suggested response protocol and location pin.",
    cta: "Open dashboard →",
    accent: "from-blue-500/20 to-blue-500/5 border-blue-500/40",
  },
  {
    href: "/heatmap",
    phase: "BEFORE",
    title: "Crowd Risk Heatmap",
    blurb: "CCTV frame → Gemini Vision → density score. Flag overcrowding before incidents occur.",
    cta: "Analyze a frame →",
    accent: "from-amber-500/20 to-amber-500/5 border-amber-500/40",
  },
  {
    href: "/report",
    phase: "AFTER",
    title: "AI Incident Report",
    blurb: "Gemini auto-drafts a timestamped compliance report from Firestore incident data.",
    cta: "View latest report →",
    accent: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/40",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section className="mb-16 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Live demo • Firebase Hosting • Gemini 1.5 Flash
        </div>
        <h1 className="mx-auto max-w-3xl text-5xl font-semibold leading-tight tracking-tight">
          AI Crisis Co-Pilot for Hospitality Venues.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
          SahayakAI detects, translates, routes, and documents every hotel emergency
          — across the full <span className="text-white">BEFORE / DURING / AFTER</span> lifecycle.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/sos"
            className="rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/30 hover:bg-red-400"
          >
            Try the Guest SOS demo
          </Link>
          <Link
            href="/staff"
            className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Open Staff Dashboard
          </Link>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`card group relative overflow-hidden border bg-gradient-to-br ${t.accent} p-6 transition hover:-translate-y-0.5`}
          >
            <div className="mb-3 text-xs font-mono tracking-widest text-zinc-400">
              {t.phase}
            </div>
            <h3 className="text-2xl font-semibold">{t.title}</h3>
            <p className="mt-2 text-sm text-zinc-300">{t.blurb}</p>
            <div className="mt-6 text-sm font-medium text-white/90 group-hover:translate-x-1 transition">
              {t.cta}
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-16 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-8 sm:grid-cols-3">
        <div>
          <div className="text-xs text-zinc-400">Problem</div>
          <div className="mt-1 font-semibold">Rapid Crisis Response in Hospitality</div>
          <p className="mt-2 text-sm text-zinc-400">
            During a hotel crisis, information is siloed — guests can&apos;t communicate,
            staff lack context, responders arrive blind.
          </p>
        </div>
        <div>
          <div className="text-xs text-zinc-400">Our Solution</div>
          <div className="mt-1 font-semibold">One AI layer across 3 phases</div>
          <p className="mt-2 text-sm text-zinc-400">
            Gemini bridges guests, staff, and emergency services in real time —
            in any of 12 Indian languages.
          </p>
        </div>
        <div>
          <div className="text-xs text-zinc-400">Why it wins</div>
          <div className="mt-1 font-semibold">Only full-lifecycle crisis AI</div>
          <p className="mt-2 text-sm text-zinc-400">
            Proactive detection + multilingual triage + auto-documentation.
            No competitor covers all three.
          </p>
        </div>
      </section>
    </div>
  );
}
