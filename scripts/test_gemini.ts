import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from "dotenv";
dotenv.config({ path: '.env' });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        { role: "model", parts: [{ text: "Halo bre!" }] },
        { role: "user", parts: [{ text: "mau jazz bar di jakbar" }] }
      ],
      // THIS IS IDENTICAL TO ChatInterface.tsx!
      tools: [
        { googleSearch: {} },
        { functionDeclarations: [{
          name: "displayPlaces",
          description: "Display recommended places on the map to the user.",
          parameters: {
            type: Type.OBJECT,
            properties: { places: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING } }, required: ["name"] } } },
            required: ["places"]
          }
        }] }
      ],
      toolConfig: { includeServerSideToolInvocations: true },
      config: {
        systemInstruction: "Kamu bot skena. Panggil function displayPlaces.",
        temperature: 0.7,
      }
    } as any);
    console.log("TEXT:", response.text);
    console.log("CALLS:", JSON.stringify(response.functionCalls));
  } catch (e: any) {
    console.log("ERROR MESSAGE:", e.message);
  }
}
run();
