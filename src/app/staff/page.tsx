"use client";

import { useEffect, useState } from "react";
import {
  collection, onSnapshot, orderBy, query, doc, updateDoc, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

type Incident = {
  id: string;
  emergencyType?: string;
  severity?: number;
  translatedEnglish?: string;
  originalMessage?: string;
  language?: string;
  roomNumber?: string;
  suggestedProtocol?: string;
  keyEntities?: string[];
  status?: string;
  createdAt?: Timestamp;
  location?: { lat: number; lng: number };
};

const sevColor = (s?: number) =>
  s === 5 ? "bg-red-500" : s === 4 ? "bg-orange-500" : s === 3 ? "bg-amber-500" : s === 2 ? "bg-yellow-500" : "bg-emerald-500";

export default function StaffDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selected, setSelected] = useState<Incident | null>(null);

  useEffect(() => {
    const q = query(collection(db, "incidents"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list: Incident[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Incident, "id">) }));
      setIncidents(list);
      if (!selected && list.length > 0) setSelected(list[0]);
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function markResolved(id: string) {
    await updateDoc(doc(db, "incidents", id), { status: "resolved", resolvedAt: new Date().toISOString() });
  }

  const openCount = incidents.filter((i) => i.status !== "resolved").length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-mono tracking-widest text-blue-400">DURING — STAFF DASHBOARD</div>
          <h1 className="text-3xl font-semibold">Live Incident Feed</h1>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div>
            <div className="text-xs text-zinc-400">OPEN</div>
            <div className="text-2xl font-semibold text-red-400">{openCount}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-400">TOTAL TODAY</div>
            <div className="text-2xl font-semibold">{incidents.length}</div>
          </div>
        </div>
      </div>

      {incidents.length === 0 ? (
        <div className="card mt-8 p-10 text-center text-zinc-400">
          No incidents yet.{" "}
          <Link href="/sos" className="text-blue-400 underline">
            Trigger an SOS
          </Link>{" "}
          to see one appear here in real time.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <div className="space-y-2">
            {incidents.map((i) => (
              <button
                key={i.id}
                onClick={() => setSelected(i)}
                className={`card w-full p-4 text-left transition hover:border-white/20 ${
                  selected?.id === i.id ? "border-white/30 bg-white/10" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${sevColor(i.severity)}`} />
                    <span className="text-sm font-semibold">{i.emergencyType || "Other"}</span>
                    <span className="text-xs text-zinc-400">• Sev {i.severity ?? "?"}</span>
                  </div>
                  {i.status === "resolved" ? (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">RESOLVED</span>
                  ) : (
                    <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] text-red-300">OPEN</span>
                  )}
                </div>
                <div className="mt-1 text-xs text-zinc-400">Room {i.roomNumber || "—"} • {i.language?.toUpperCase() || "—"}</div>
                <div className="mt-2 line-clamp-2 text-sm text-zinc-200">{i.translatedEnglish}</div>
              </button>
            ))}
          </div>

          {selected && (
            <div className="card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${sevColor(selected.severity)}`} />
                    <h2 className="text-2xl font-semibold">{selected.emergencyType}</h2>
                    <span className="text-sm text-zinc-400">Severity {selected.severity}/5</span>
                  </div>
                  <div className="mt-1 text-sm text-zinc-400">
                    Room {selected.roomNumber} • Received in {selected.language?.toUpperCase()}
                  </div>
                </div>
                <div className="flex gap-2">
                  {selected.status !== "resolved" && (
                    <button
                      onClick={() => markResolved(selected.id)}
                      className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold hover:bg-emerald-400"
                    >
                      Mark Resolved
                    </button>
                  )}
                  <Link
                    href={`/report/${selected.id}`}
                    className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
                  >
                    Generate Report
                  </Link>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-zinc-400">Original Message</div>
                  <div className="mt-1 rounded-lg border border-white/10 bg-black/40 p-3 text-sm">
                    {selected.originalMessage}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-zinc-400">Translated (English)</div>
                  <div className="mt-1 rounded-lg border border-white/10 bg-black/40 p-3 text-sm">
                    {selected.translatedEnglish}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs uppercase tracking-wide text-zinc-400">AI-Suggested Protocol</div>
                <div className="mt-1 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-100">
                  {selected.suggestedProtocol}
                </div>
              </div>

              {selected.keyEntities && selected.keyEntities.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs uppercase tracking-wide text-zinc-400">Extracted Entities</div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {selected.keyEntities.map((e) => (
                      <span key={e} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selected.location && (
                <div className="mt-6">
                  <div className="text-xs uppercase tracking-wide text-zinc-400">Location Pin</div>
                  <div className="mt-1 rounded-lg border border-white/10 bg-black/40 p-4">
                    <iframe
                      title="map"
                      className="h-64 w-full rounded-md border-0"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${selected.location.lng - 0.005},${selected.location.lat - 0.003},${selected.location.lng + 0.005},${selected.location.lat + 0.003}&layer=mapnik&marker=${selected.location.lat},${selected.location.lng}`}
                    />
                    <div className="mt-2 text-xs text-zinc-400">
                      {selected.location.lat.toFixed(4)}, {selected.location.lng.toFixed(4)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
