"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी (Hindi)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
  { code: "bn", label: "বাংলা (Bengali)" },
  { code: "mr", label: "मराठी (Marathi)" },
  { code: "gu", label: "ગુજરાતી (Gujarati)" },
  { code: "pa", label: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "ml", label: "മലയാളം (Malayalam)" },
  { code: "or", label: "ଓଡ଼ିଆ (Odia)" },
  { code: "as", label: "অসমীয়া (Assamese)" },
];

const PRESETS = [
  { lang: "hi", text: "मुझे सीने में बहुत दर्द हो रहा है, कृपया जल्दी मदद भेजें। मैं कमरा 302 में हूँ।" },
  { lang: "ta", text: "5-வது மாடியில் புகை வருகிறது. யாரோ உதவி செய்ய வேண்டும்." },
  { lang: "en", text: "Someone suspicious is trying to break into my room 415, please send security now." },
];

type Classification = {
  emergencyType: string;
  severity: number;
  translatedEnglish: string;
  suggestedProtocol: string;
  keyEntities?: string[];
};

export default function SosPage() {
  const [language, setLanguage] = useState("hi");
  const [roomNumber, setRoomNumber] = useState("302");
  const [message, setMessage] = useState(PRESETS[0].text);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Classification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [incidentId, setIncidentId] = useState<string | null>(null);

  async function triggerSOS() {
    setLoading(true);
    setError(null);
    setResult(null);
    setIncidentId(null);
    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, language, roomNumber }),
      });
      if (!res.ok) throw new Error(`Classify failed: ${res.status}`);
      const classification: Classification = await res.json();
      setResult(classification);

      const docRef = await addDoc(collection(db, "incidents"), {
        ...classification,
        originalMessage: message,
        language,
        roomNumber,
        status: "open",
        createdAt: serverTimestamp(),
        location: { lat: 12.9716 + Math.random() * 0.01, lng: 77.5946 + Math.random() * 0.01 },
      });
      setIncidentId(docRef.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 text-xs font-mono tracking-widest text-red-400">DURING — GUEST SOS</div>
      <h1 className="text-3xl font-semibold">Emergency Help</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Select your language, describe the emergency (or tap a preset), and press SOS.
        Gemini will classify and alert staff in under 2 seconds.
      </p>

      <div className="mt-6 card p-6">
        <label className="text-xs uppercase tracking-wide text-zinc-400">Language</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>

        <label className="mt-4 block text-xs uppercase tracking-wide text-zinc-400">Room / Location</label>
        <input
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
          placeholder="e.g. 302 or Lobby"
        />

        <label className="mt-4 block text-xs uppercase tracking-wide text-zinc-400">Describe the emergency</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => { setMessage(p.text); setLanguage(p.lang); }}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300 hover:bg-white/10"
            >
              Preset {i + 1}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={triggerSOS}
        disabled={loading || !message.trim()}
        className="mt-6 w-full rounded-2xl bg-red-500 px-6 py-6 text-xl font-bold text-white shadow-xl shadow-red-500/30 transition hover:bg-red-400 disabled:opacity-50 sos-pulse"
      >
        {loading ? "Classifying with Gemini..." : "🚨 SEND SOS"}
      </button>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 card p-6">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wide text-emerald-400">AI Classification Complete</div>
            <div className="text-xs text-zinc-400">via Gemini 1.5 Flash</div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Stat label="Emergency Type" value={result.emergencyType} />
            <Stat label="Severity" value={`${result.severity} / 5`} highlight={result.severity >= 4} />
          </div>
          <div className="mt-4">
            <div className="text-xs uppercase tracking-wide text-zinc-400">Translated (English)</div>
            <p className="mt-1 text-sm">{result.translatedEnglish}</p>
          </div>
          <div className="mt-4">
            <div className="text-xs uppercase tracking-wide text-zinc-400">AI-Suggested Protocol</div>
            <p className="mt-1 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-100">
              {result.suggestedProtocol}
            </p>
          </div>
          {result.keyEntities && result.keyEntities.length > 0 && (
            <div className="mt-4">
              <div className="text-xs uppercase tracking-wide text-zinc-400">Key Entities</div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {result.keyEntities.map((e) => (
                  <span key={e} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          )}
          {incidentId && (
            <div className="mt-6 flex gap-3">
              <Link
                href="/staff"
                className="flex-1 rounded-full bg-blue-500 px-4 py-2 text-center text-sm font-semibold hover:bg-blue-400"
              >
                Staff notified → Open dashboard
              </Link>
              <Link
                href={`/report/${incidentId}`}
                className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
              >
                View report
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? "border-red-500/50 bg-red-500/10" : "border-white/10 bg-white/5"}`}>
      <div className="text-xs uppercase tracking-wide text-zinc-400">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
