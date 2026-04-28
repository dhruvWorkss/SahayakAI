# SahayakAI — AI Crisis Co-Pilot for Hospitality

> **Google Solution Challenge 2026** — Problem Statement: *Rapid Crisis Response — Accelerated Emergency Response and Crisis Coordination in Hospitality*.
> Team: **404 Coders**.

**Live demo:** https://sahayakai-one.vercel.app

---

## What it does

SahayakAI is a full-lifecycle AI crisis co-pilot for hotels and hospitality venues. Unlike existing solutions that only react *during* an emergency, SahayakAI operates across **three phases**:

| Phase | Feature | Google AI used |
|---|---|---|
| **BEFORE** | Crowd density risk heatmap from CCTV frames | Gemini 2.5 Flash (vision) |
| **DURING** | 1-tap + voice SOS in 12 Indian languages with sub-2-second AI triage | Gemini 2.5 Flash (text) |
| **AFTER** | Auto-generated compliance incident report | Gemini 2.5 Flash (text) |

It eliminates fragmented communication between distressed guests, on-site staff, and emergency services — in real time, in any Indian language.

---

## Demo flow (3 minutes)

1. **BEFORE** → Open `/heatmap`, select the Ballroom zone, click *Analyze CCTV frame*. Gemini Vision returns density + risk factors.
2. **DURING** → Open `/sos`, pick the Hindi chest-pain preset, press **SEND SOS**. Gemini classifies it as Medical / Severity 5, translates it, drafts a protocol in ~1.5 sec. Incident writes to Firestore.
3. **DURING (staff)** → Open `/staff` on a second device. The new incident appears live via Firestore `onSnapshot` with location pin + AI protocol. One tap to dispatch / resolve.
4. **AFTER** → From any incident, click *Generate Report*. Gemini drafts a formal timestamped compliance report with recommendations. Browser print = PDF.

---

## Architecture

```
┌────────────────────────────┐     ┌────────────────────────┐
│  Next.js 15 (App Router)   │     │   Google AI Platform   │
│  ────────────────────────  │     │  ────────────────────  │
│  / (home)                  │     │                        │
│  /sos (guest)              │──▶──│  Gemini 2.5 Flash      │
│  /staff (dashboard)        │     │   - text classify      │
│  /heatmap (crowd vision)   │     │   - vision analysis    │
│  /report/[id] (AFTER)      │     │   - report generation  │
└─────────────┬──────────────┘     └────────────────────────┘
              │
              ▼
┌────────────────────────────┐
│  Firebase                  │
│  ────────────────────────  │
│  Firestore (incidents,     │
│  real-time onSnapshot)     │
│  Security rules deployed   │
└────────────────────────────┘
              │
              ▼
┌────────────────────────────┐
│  Vercel (cloud deployment) │
│  sahayakai-one.vercel.app  │
└────────────────────────────┘
```

---

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind v4
- **Gemini 2.5 Flash** via `@google/generative-ai` (3 server-side API routes)
- **Firebase Firestore** (real-time sync, client SDK)
- **Vercel** (cloud deployment)
- OpenStreetMap tiles for the incident location pin

> The PPT originally targets Firebase Hosting + Cloud Run. For this sprint we deployed to Vercel — the Solution-Challenge "cloud deployment" requirement is satisfied — with Firestore still serving as the realtime backend. Architecture is portable to Cloud Run in <30 minutes.

---

## Getting started locally

```bash
git clone <this-repo>
cd sahayakai
npm install
cp .env.example .env.local    # fill in GEMINI_API_KEY + NEXT_PUBLIC_FIREBASE_*
npm run dev                   # http://localhost:3000
```

---

## Key files

| Path | What it does |
|---|---|
| `src/app/page.tsx` | Home hero + 4 demo tiles |
| `src/app/sos/page.tsx` | Guest SOS screen (12 languages, presets, Firestore write) |
| `src/app/staff/page.tsx` | Real-time staff dashboard via `onSnapshot` |
| `src/app/heatmap/page.tsx` | Floor-plan SVG + Gemini Vision CCTV analyzer |
| `src/app/report/[id]/page.tsx` | AI-generated incident report, print-to-PDF |
| `src/app/api/classify/route.ts` | Gemini triage — JSON-schema output |
| `src/app/api/vision/route.ts` | Gemini Vision — crowd risk analysis |
| `src/app/api/report/route.ts` | Gemini Markdown report generator |
| `src/lib/firebase.ts` | Firebase Web SDK singleton |
| `src/lib/gemini.ts` | `GoogleGenerativeAI` singleton + `FLASH_MODEL` constant |
| `firestore.rules` | Demo-open rules for `incidents` collection |

---

## Solution Challenge rubric coverage

| Requirement | How |
|---|---|
| ✅ **Cloud deployment** | Vercel serverless production URL (`sahayakai-one.vercel.app`) |
| ✅ **Google AI model** | Gemini 2.5 Flash in 3 server-side API routes (text triage, vision, report) |
| ✅ **Working prototype** | 4 linked screens, real Firestore reads/writes, live cross-device sync |
| ✅ **Public repo** | This repository |
| ✅ **Demo video** | See link in PPT Slide 13 |

---

## Roadmap (per PPT Slide 12)

- **Phase 2 (3–6 mo):** Live CCTV streams, IoT sensor integration, direct emergency-services API.
- **Phase 3 (6–12 mo):** Expansion beyond hospitality (malls, airports, stadiums), predictive risk ML, SaaS white-label for hotel chains.

---

## Team

**404 Coders**
