// lib/gemini-client.ts
import { GoogleGenAI } from "@google/genai";

if (!process.env.GOOGLE_API_KEY) {
  throw new Error("Missing GOOGLE_API_KEY environment variable.");
}

const genAI = new GoogleGenAI(process.env.GOOGLE_API_KEY);

export default genAI;
