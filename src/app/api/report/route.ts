import { NextResponse } from "next/server";
import { genAI, FLASH_MODEL } from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REPORT_PROMPT = `You are SahayakAI, drafting a formal post-incident report for hotel management and compliance.

Output clean Markdown with these sections (use these exact headings):

## Incident Summary
One paragraph — what happened, when, where, outcome.

## Timeline
A chronological bulleted list with timestamps (HH:MM) — SOS received, staff dispatched, responder arrived, resolution.

## Response Actions
Bullet list of actions taken by staff + responders.

## Resolution
One paragraph — final status, time-to-resolution, any follow-up required.

## Recommendations
2-3 concrete structural or operational recommendations based on this incident type, formatted as bullets.

Keep it professional, concise, and actionable. Do NOT invent facts beyond what's in the incident data.`;

export async function POST(request: Request) {
  try {
    const { incident } = await request.json();
    if (!incident) {
      return NextResponse.json({ error: "incident data required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: FLASH_MODEL,
      generationConfig: { temperature: 0.4 },
      systemInstruction: REPORT_PROMPT,
    });

    const result = await model.generateContent(
      `Draft the incident report from this Firestore record:\n\n${JSON.stringify(incident, null, 2)}`,
    );

    return NextResponse.json({ markdown: result.response.text() });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "report failed";
    console.error("[/api/report]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
