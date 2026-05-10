import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeJournalContent(content: string): Promise<AnalysisResult> {
  const prompt = `Analyze the following journal entry for mental health markers. 
  Entry: "${content}"
  
  Please provide:
  1. Sentiment score (-1 to 1) and label.
  2. Detected emotions and confidence levels.
  3. Cognitive distortions (e.g., Catastrophizing, All-or-nothing thinking).
  4. Mental health risk levels (0-100) for Depression, Stress, and Burnout.
  5. Crisis detection (true if self-harm or immediate danger is implied).
  6. A brief clinical explanation of the findings.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                label: { type: Type.STRING }
              }
            },
            emotions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  confidence: { type: Type.NUMBER }
                }
              }
            },
            distortions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            riskLevels: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  level: { type: Type.STRING },
                  score: { type: Type.NUMBER }
                }
              }
            },
            crisisPrediction: {
              type: Type.OBJECT,
              properties: {
                detected: { type: Type.BOOLEAN },
                reason: { type: Type.STRING }
              }
            },
            explanation: { type: Type.STRING }
          },
          required: ["sentiment", "emotions", "distortions", "riskLevels", "crisisPrediction", "explanation"]
        }
      }
    });

    const resultMarkdown = response.text;
    const result = JSON.parse(resultMarkdown);
    return result as AnalysisResult;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
}
