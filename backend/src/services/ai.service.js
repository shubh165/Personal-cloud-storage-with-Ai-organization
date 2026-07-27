import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const cleanJSON = (text) => {
  try {
    // remove ```json and ```
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.log("JSON parse failed");

    return {
      summary: text,
      tags: text.split(" ").slice(0, 5),
    };
  }
};

export const analyzeImage = async (imagePath) => {
  try {
    const base64Image = fs.readFileSync(imagePath, {
      encoding: "base64",
    });

    // detect mime type
    const ext = path.extname(imagePath);
    let mimeType = "image/jpeg";
    if (ext === ".png") mimeType = "image/png";
    if (ext === ".webp") mimeType = "image/webp";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", //  YOUR MODEL
      contents: [
        {
          inlineData: {
            mimeType,
            data: base64Image,
          },
        },
        {
          text: `
Analyze this image.

Rules:
- Summary MUST be 1 short sentence (max 20 - 30 words)
- Tags MUST be only 4 to 7 words
- No long explanation
- No extra text

Return ONLY JSON:

{
  "summary": "...",
  "tags": ["", "", ""]
}
`,
        },
      ],
    });

    const text = response.text;

    console.log("RAW:", text);

    // simple parsing
    const parsed = cleanJSON(text);

    return {
      summary: parsed.summary || "Image uploaded",
      tags: parsed.tags || ["image"],
    };
  } catch (error) {
    console.error("Gemini 3 error:", error.message);

    return {
      summary: "Image uploaded",
      tags: ["image"],
    };
  }
};

export const analyzeText = async (textData) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          text: `
Analyze this document.

STRICT RULES:
- Summary: max 40 - 50 words
- Tags: exactly 4 to 7 keywords
- No explanation

Return ONLY JSON:

{
  "summary": "...",
  "tags": ["", "", ""]
}

TEXT:
${textData.slice(0, 5000)}
          `,
        },
      ],
    });

    const raw = response.text;

    const parsed = cleanJSON(raw);

    return {
      summary: parsed.summary || "",
      tags: parsed.tags || [],
    };
  } catch (error) {
    console.error("Text AI error:", error.message);

    return {
      summary: "",
      tags: [],
    };
  }
};

export const transcribeAudio = async (audioPath) => {
  try {
    const audioBuffer = fs.readFileSync(audioPath);
    const base64Audio = audioBuffer.toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            mimeType: "audio/mpeg", 
            data: base64Audio,
          },
        },
        {
          text: `
Transcribe and summarize this audio.

RULES:
- Summary: max 20 - 30 words
- Tags: exactly 4 - 7 keywords

Return ONLY JSON:

{
  "summary": "...",
  "tags": ["", "", ""],
  "transcript": "short transcription"
}
          `,
        },
      ],
    });

    const raw = response.text;

    const parsed = cleanJSON(raw); // your existing function

    return {
      summary: parsed.summary || "",
      tags: parsed.tags || [],
      transcript: parsed.transcript || "",
    };
  } catch (error) {
    console.error("Audio AI error:", error.message);

    return {
      summary: "Audio uploaded",
      tags: ["audio"],
      transcript: "",
    };
  }
};
