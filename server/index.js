
import express from "express";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { coordinateManagementChallenge } from "./multiAgent.js";

const app = express();
const PORT = 3001;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "STRATIVA AI Backend",
  });
});

app.post("/api/analyze", async (req, res) => {
  try {
    const challenge = req.body?.challenge;

    if (
      typeof challenge !== "string" ||
      challenge.trim().length < 15
    ) {
      return res.status(400).json({
        error:
          "Please provide a management challenge of at least 15 characters.",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",

      contents: `Analyze this management challenge for STRATIVA:

${challenge.trim()}

Return a practical, concise management analysis with:

- category: one short classification
- recommendations: exactly 3 specific, actionable management tasks
- reasoning: exactly 3 explanations, one for each recommendation in the same order, explaining why the action addresses the challenge
- expectedImpact: exactly 3 realistic potential business outcomes, one for each recommendation in the same order
- risks: exactly 3 relevant business risks
- metrics: exactly 3 measurable performance indicators

Base your recommendations and explanations on the challenge provided.
Explain the business logic clearly for a midlevel manager.
Do not invent company facts or claim that estimated outcomes are guaranteed.
Keep each explanation concise and practical.`,

      config: {
        responseMimeType: "application/json",

        responseSchema: {
          type: "OBJECT",

          properties: {
            category: {
              type: "STRING",
            },

            recommendations: {
              type: "ARRAY",
              items: {
                type: "STRING",
              },
            },

            reasoning: {
              type: "ARRAY",
              items: {
                type: "STRING",
              },
            },

            expectedImpact: {
              type: "ARRAY",
              items: {
                type: "STRING",
              },
            },

            risks: {
              type: "ARRAY",
              items: {
                type: "STRING",
              },
            },

            metrics: {
              type: "ARRAY",
              items: {
                type: "STRING",
              },
            },
          },

          required: [
            "category",
            "recommendations",
            "reasoning",
            "expectedImpact",
            "risks",
            "metrics",
          ],
        },
      },
    });

    const analysis = JSON.parse(response.text);

    res.json(analysis);
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    console.error("Underlying cause:", error.cause);

    res.status(500).json({
      error: "AI analysis is temporarily unavailable.",
    });
  }
});


app.post("/api/coordinate", async (req, res) => {
  try {
    const challenge = req.body?.challenge;

    if (
      typeof challenge !== "string" ||
      challenge.trim().length < 15
    ) {
      return res.status(400).json({
        error:
          "Please provide a management challenge of at least 15 characters.",
      });
    }

    const existingTasks = Array.isArray(req.body.existingTasks)
  ? req.body.existingTasks
  : [];

const result = await coordinateManagementChallenge(
  challenge.trim(),
  existingTasks
);

    res.json(result);
  } catch (error) {
    console.error("Multi-agent coordination failed:", error);

    res.status(500).json({
      error: "Multi-agent coordination is temporarily unavailable.",
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `STRATIVA backend running at http://localhost:${PORT}`
  );
});
