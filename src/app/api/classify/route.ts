import { NextResponse } from "next/server";
import { genAI, FLASH_MODEL } from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are SahayakAI, an emergency triage AI for hotels and hospitality venues in India.
A guest has sent a distress message. It may be in Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati, Punjabi, Malayalam, Odia, Assamese, or English.

Output STRICT JSON with these fields (no markdown, no prose):
{
  "emergencyType": "Medical" | "Fire" | "Security" | "Structural" | "Other",
  "severity": 1 | 2 | 3 | 4 | 5,
  "translatedEnglish": "<one-sentence English translation of the guest's message>",
  "suggestedProtocol": "<2-3 sentence response protocol for staff, including which responder to page and immediate actions>",
  "keyEntities": ["<short list of extracted entities like 'room 302', 'chest pain', 'smoke on 5th floor'>"]
}

Severity scale: 1=minor (non-urgent), 3=significant (dispatch staff now), 5=life-threatening (dispatch + call emergency services).`;

export async function POST(request: Request) {
  try {
    const { message, language, roomNumber } = await request.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: FLASH_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
      systemInstruction: SYSTEM_PROMPT,
    });

    const prompt = `Guest message (language=${language || "unknown"}, room=${roomNumber || "unknown"}):\n"${message}"`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        emergencyType: "Other",
        severity: 3,
        translatedEnglish: message,
        suggestedProtocol: "Dispatch nearest staff member to verify the situation and escalate if needed.",
        keyEntities: [],
        _rawResponse: text,
      };
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "classification failed";
    console.error("[/api/classify]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
