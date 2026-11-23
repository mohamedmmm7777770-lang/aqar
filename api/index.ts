import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import apiRoutes from "../server/apiRoutes.js";
import { properties } from "../src/data/properties.js";
import { openRouterKeys } from "./openRouterKeys.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const geminiKeys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY
].filter(Boolean) as string[];

let currentKeyIndex = 0;

function getAiClient() {
  const key = geminiKeys[currentKeyIndex] || "dummy";
  return new GoogleGenAI({ 
    apiKey: key,
    httpOptions: {
      headers: { 'User-Agent': 'aistudio-build' }
    }
  });
}

async function executeWithRotation(operation: (ai: GoogleGenAI) => Promise<any>) {
  if (geminiKeys.length === 0) throw new Error("No Gemini keys configured");
  
  let attempts = 0;
  while (attempts < geminiKeys.length) {
    try {
      const ai = getAiClient();
      return await operation(ai);
    } catch (error: any) {
      if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("quota")) {
        console.warn(`Key at index ${currentKeyIndex} hit quota. Rotating to next key...`);
        currentKeyIndex = (currentKeyIndex + 1) % geminiKeys.length;
        attempts++;
      } else {
        throw error;
      }
    }
  }
  throw new Error("All API keys have exhausted their daily quota.");
}

let currentOpenRouterKeyIndex = 0;

async function executeOpenRouterWithRotation(promptContext: string, systemInstruction: string) {
  if (openRouterKeys.length === 0) throw new Error("No OpenRouter keys configured");
  
  let attempts = 0;
  while (attempts < openRouterKeys.length) {
    const key = openRouterKeys[currentOpenRouterKeyIndex];
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://aqar.vercel.app", // optional but recommended
          "X-Title": "Aqar Assistant"
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-lite-preview-02-05:free",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: promptContext }
          ]
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("429 Quota Exceeded");
        }
        const errorText = await response.text();
        throw new Error(`OpenRouter Error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (error: any) {
      if (error?.message?.includes("429") || error?.message?.includes("Quota")) {
        console.warn(`OpenRouter Key at index ${currentOpenRouterKeyIndex} hit quota. Rotating to next key...`);
        currentOpenRouterKeyIndex = (currentOpenRouterKeyIndex + 1) % openRouterKeys.length;
        attempts++;
      } else {
        throw error;
      }
    }
  }
  throw new Error("All OpenRouter API keys have exhausted their quota or failed.");
}

// API Route for real estate assistant using Gemini + Maps Grounding
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    
    const promptContext = `
Here are the current real estate properties available in our database. You must answer questions based on this data:
${JSON.stringify(properties, null, 2)}

User Question: ${message}
`;

    const systemInstruction = "أنت مساعد عقاري ذكي لالموقع. أجب باختصار شديد (لا تزيد عن سطرين أو ثلاثة) وبطريقة ودية جداً باللهجة المصرية. اعتمد على بيانات العقارات المرفقة.";
    
    const textResponse = await executeOpenRouterWithRotation(promptContext, systemInstruction);
    
    // OpenRouter doesn't return grounding chunks directly for free models in the same way,
    // so we return an empty array for chunks to avoid breaking frontend
    const chunks: any[] = [];

    res.json({ text: textResponse, chunks });

  } catch (error: any) {
    console.error(error);
    if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("quota")) {
      res.status(429).json({ error: "عذراً، لقد تم تجاوز الحد المسموح به للطلبات (Quota Exceeded). يرجى التحقق من خطة الحساب الخاصة بك أو المحاولة لاحقاً." });
    } else {
      res.status(500).json({ error: "An error occurred with the AI request" });
    }
  }
});

app.post("/api/tts", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });
    
    const ttsResponse = await executeWithRotation(async (ai) => {
      return await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: `تحدث باللهجة المصرية بصوت طبيعي: ${text}` }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
          },
        },
      });
    });
    
    const pcmBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (pcmBase64) {
      const pcmBuffer = Buffer.from(pcmBase64, 'base64');
      const wavHeader = Buffer.alloc(44);
      const totalDataLen = pcmBuffer.length + 36;
      const numChannels = 1;
      const sampleRate = 24000;
      const byteRate = sampleRate * numChannels * 2;
      const blockAlign = numChannels * 2;

      wavHeader.write('RIFF', 0);
      wavHeader.writeUInt32LE(totalDataLen, 4);
      wavHeader.write('WAVE', 8);
      wavHeader.write('fmt ', 12);
      wavHeader.writeUInt32LE(16, 16); 
      wavHeader.writeUInt16LE(1, 20); 
      wavHeader.writeUInt16LE(numChannels, 22);
      wavHeader.writeUInt32LE(sampleRate, 24);
      wavHeader.writeUInt32LE(byteRate, 28);
      wavHeader.writeUInt16LE(blockAlign, 32);
      wavHeader.writeUInt16LE(16, 34);
      wavHeader.write('data', 36);
      wavHeader.writeUInt32LE(pcmBuffer.length, 40);

      const wavBuffer = Buffer.concat([wavHeader, pcmBuffer]);
      const audioWavBase64 = wavBuffer.toString('base64');
      res.json({ audio: audioWavBase64 });
    } else {
      res.status(500).json({ error: "No audio generated" });
    }
  } catch (error) {
    console.error("TTS error:", error);
    res.status(500).json({ error: "TTS generation failed" });
  }
});

app.use("/api", apiRoutes);

export default app;
