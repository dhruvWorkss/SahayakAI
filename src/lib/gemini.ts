import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("[SahayakAI] GEMINI_API_KEY is not set — API routes will fail.");
}

export const genAI = new GoogleGenerativeAI(apiKey || "");

export const FLASH_MODEL = "gemini-2.5-flash";
