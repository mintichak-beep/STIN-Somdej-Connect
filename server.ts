import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API routes
app.post("/api/analyze-pdf", async (req, res) => {
  const { text, filename } = req.body;

  if (!text) {
    return res.status(400).json({ error: "No text provided for analysis" });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analyze the following text extracted from a PDF document named "${filename}". 
      Return a structured analysis in JSON format with the following fields:
      - executiveSummary: A brief overview of the document.
      - keyFindings: An array of the most important points found.
      - importantNumbers: An array of key statistics, dates, or financial figures.
      - risks: An array of potential issues or red flags identified.
      - recommendations: An array of suggested next steps.
      - actionItems: An array of specific tasks that should be performed.

      Text:
      ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            keyFindings: { type: Type.ARRAY, items: { type: Type.STRING } },
            importantNumbers: { type: Type.ARRAY, items: { type: Type.STRING } },
            risks: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["executiveSummary", "keyFindings", "importantNumbers", "risks", "recommendations", "actionItems"]
        }
      }
    });

    res.json(JSON.parse(response.text));
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ error: "Failed to analyze document: " + error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
