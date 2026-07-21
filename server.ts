import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

console.log(`Starting server with NODE_ENV=${process.env.NODE_ENV}`);

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of Gemini
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set. Please set it in the Settings menu.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV });
});

app.post("/api/analyze-pdf", async (req, res) => {
  const { text, filename } = req.body;

  if (!text) {
    return res.status(400).json({ error: "No text provided for analysis" });
  }

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", // Use a valid model name
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
  try {
    // Determine if we are running in production mode
    // Cloud Run always sets K_SERVICE. NODE_ENV is typically 'production' in deployed environments.
    const isProduction = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "prod" || !!process.env.K_SERVICE;
    
    if (!isProduction) {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite middleware loaded");
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      const indexPath = path.join(distPath, 'index.html');
      
      console.log(`Serving static files from ${distPath}`);
      
      if (!fs.existsSync(indexPath)) {
        console.error(`CRITICAL ERROR: ${indexPath} not found! Build might have failed.`);
      }

      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(indexPath, (err) => {
          if (err) {
            console.error("Error sending index.html:", err);
            if (!res.headersSent) {
              res.status(500).send("Error loading application");
            }
          }
        });
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT} (0.0.0.0)`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
