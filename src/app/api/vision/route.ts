import { NextResponse } from "next/server";
import { genAI, FLASH_MODEL } from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VISION_PROMPT = `You are SahayakAI Vision, analyzing a CCTV frame from a hotel/hospitality venue for crowd risk.

Output STRICT JSON (no markdown):
{
  "crowdDensity": "Low" | "Medium" | "High" | "Critical",
  "estimatedPeople": <integer>,
  "riskScore": <integer 1-10>,
  "riskFactors": ["<short bullets: blocked exits, clustering near stairs, panic indicators, smoke, etc.>"],
  "recommendedAction": "<one-sentence staff recommendation>"
}`;

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType } = await request.json();
    if (!imageBase64) {
      return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: FLASH_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
      systemInstruction: VISION_PROMPT,
    });

    const result = await model.generateContent([
      { inlineData: { data: imageBase64, mimeType: mimeType || "image/jpeg" } },
      { text: "Analyze this CCTV frame." },
    ]);
    const text = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        crowdDensity: "Medium",
        estimatedPeople: 0,
        riskScore: 5,
        riskFactors: ["Unable to parse vision response"],
        recommendedAction: "Review frame manually.",
        _rawResponse: text,
      };
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "vision failed";
    console.error("[/api/vision]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
