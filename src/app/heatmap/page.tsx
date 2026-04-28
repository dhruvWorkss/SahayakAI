"use client";

import { useState } from "react";

type VisionResult = {
  crowdDensity: string;
  estimatedPeople: number;
  riskScore: number;
  riskFactors: string[];
  recommendedAction: string;
};

const ZONES = [
  { id: "A", label: "Lobby", x: 10, y: 10, w: 35, h: 30, baseRisk: 3 },
  { id: "B", label: "Restaurant", x: 50, y: 10, w: 40, h: 25, baseRisk: 5 },
  { id: "C", label: "Ballroom", x: 10, y: 45, w: 50, h: 40, baseRisk: 7 },
  { id: "D", label: "Pool Deck", x: 65, y: 40, w: 25, h: 20, baseRisk: 2 },
  { id: "E", label: "Gym", x: 65, y: 65, w: 25, h: 20, baseRisk: 1 },
  { id: "F", label: "Exit Corridor", x: 10, y: 88, w: 80, h: 8, baseRisk: 8 },
];

const riskColor = (r: number) =>
  r >= 7 ? "fill-red-500/60 stroke-red-400" :
  r >= 5 ? "fill-amber-500/60 stroke-amber-400" :
  r >= 3 ? "fill-yellow-500/50 stroke-yellow-400" :
  "fill-emerald-500/40 stroke-emerald-400";

export default function HeatmapPage() {
  const [selectedZone, setSelectedZone] = useState(ZONES[2]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VisionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function analyzeFrame() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Fetch a sample CCTV-like frame from Unsplash (bundled at build time via URL)
      // We convert to base64 on the client and send to Gemini via our API route.
      const sampleUrl = `/cctv/crowd.jpg`;
      const imgResp = await fetch(sampleUrl);
      if (!imgResp.ok) throw new Error("Sample frame not bundled — using fallback prompt");
      const blob = await imgResp.blob();
      const base64 = await blobToBase64(blob);

      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: blob.type || "image/jpeg" }),
      });
      if (!res.ok) throw new Error(`Vision API failed: ${res.status}`);
      const data: VisionResult = await res.json();
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="text-xs font-mono tracking-widest text-amber-400">BEFORE — CROWD RISK HEATMAP</div>
      <h1 className="text-3xl font-semibold">Venue Floor Plan — Live Risk</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Each zone is color-coded by density score. Click a zone, then analyze a sample
        CCTV frame with Gemini Vision.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="card p-4">
          <svg viewBox="0 0 100 100" className="w-full">
            <rect x="0" y="0" width="100" height="100" fill="#0f1215" />
            {ZONES.map((z) => (
              <g key={z.id} onClick={() => setSelectedZone(z)} style={{ cursor: "pointer" }}>
                <rect
                  x={z.x} y={z.y} width={z.w} height={z.h}
                  className={`${riskColor(z.baseRisk)} ${selectedZone.id === z.id ? "stroke-[0.5]" : "stroke-[0.2]"}`}
                  rx="1"
                />
                <text
                  x={z.x + z.w / 2} y={z.y + z.h / 2}
                  fill="white" fontSize="2.2" textAnchor="middle" alignmentBaseline="middle"
                  fontWeight="600"
                >
                  {z.label}
                </text>
                <text
                  x={z.x + z.w / 2} y={z.y + z.h / 2 + 3}
                  fill="white" fontSize="1.6" textAnchor="middle" opacity="0.7"
                >
                  Risk {z.baseRisk}/10
                </text>
              </g>
            ))}
          </svg>
          <div className="mt-3 flex items-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-400" /> Safe</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-yellow-400" /> Monitor</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-amber-400" /> Elevated</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-red-400" /> Critical</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="text-xs uppercase tracking-wide text-zinc-400">Selected Zone</div>
            <div className="mt-1 text-xl font-semibold">{selectedZone.label}</div>
            <div className="mt-1 text-sm text-zinc-400">Base risk score: {selectedZone.baseRisk}/10</div>
            <button
              onClick={analyzeFrame}
              disabled={loading}
              className="mt-4 w-full rounded-full bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-50"
            >
              {loading ? "Analyzing with Gemini Vision..." : "📷 Analyze CCTV frame"}
            </button>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          {result && (
            <div className="card p-5">
              <div className="text-xs uppercase tracking-wide text-emerald-400">Gemini Vision result</div>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <Stat label="Density" value={result.crowdDensity} />
                <Stat label="People" value={String(result.estimatedPeople)} />
                <Stat label="Risk" value={`${result.riskScore}/10`} highlight={result.riskScore >= 7} />
                <Stat label="Zone" value={selectedZone.id} />
              </div>
              <div className="mt-3">
                <div className="text-xs uppercase tracking-wide text-zinc-400">Risk Factors</div>
                <ul className="mt-1 list-disc pl-5 text-sm text-zinc-200">
                  {result.riskFactors?.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
              <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
                <strong>Action:</strong> {result.recommendedAction}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-2.5 ${highlight ? "border-red-500/50 bg-red-500/10" : "border-white/10 bg-white/5"}`}>
      <div className="text-[10px] uppercase tracking-wide text-zinc-400">{label}</div>
      <div className="mt-0.5 text-base font-semibold">{value}</div>
    </div>
  );
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
