import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { properties } from "./src/data/properties.js";

dotenv.config();

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

import apiRoutes from "./server/apiRoutes.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use("/api", apiRoutes);

  // API Route for real estate assistant using Gemini + Maps Grounding
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      const promptContext = `
Here are the current real estate properties available in our database. You must answer questions based on this data:
${JSON.stringify(properties, null, 2)}

User Question: ${message}
`;

      const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: promptContext,
        config: {
          systemInstruction: "أنت مساعد عقاري ذكي لمدينة كفر البطيخ. أجب باختصار شديد (لا تزيد عن سطرين أو ثلاثة) وبطريقة ودية جداً باللهجة المصرية. اعتمد على بيانات العقارات المرفقة، واستخدم Maps Grounding للبحث عن الأماكن إذا لزم الأمر.",
          tools: [{ googleMaps: {} }]
        }
      });
      
      // Extract chunks if present
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const textResponse = response.text || "";

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
      
      const ttsResponse = await ai.models.generateContent({
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
