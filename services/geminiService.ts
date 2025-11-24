import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, SentimentType } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Schema for the structured analysis output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    executiveSummary: {
      type: Type.STRING,
      description: "A comprehensive executive summary of the reviews, detailing key strengths and weaknesses.",
    },
    topActionableAreas: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Exactly 3 distinct, actionable areas for improvement based on the reviews.",
    },
    sentimentTrend: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          index: { type: Type.INTEGER },
          label: { type: Type.STRING, description: "Time label or sequence group (e.g. 'Batch 1')" },
          sentimentScore: { type: Type.NUMBER, description: "Average sentiment score between -1 (negative) and 1 (positive)." },
        },
      },
      description: "Trend of sentiment over the sequence of reviews.",
    },
    wordCloud: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          value: { type: Type.INTEGER, description: "Frequency count" },
          sentiment: { type: Type.STRING, enum: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'] },
        },
      },
      description: "List of top 20 most frequent significant keywords or phrases.",
    },
    overallSentiment: {
      type: Type.NUMBER,
      description: "Overall sentiment score from -100 to 100.",
    },
  },
  required: ["executiveSummary", "topActionableAreas", "sentimentTrend", "wordCloud", "overallSentiment"],
};

export const analyzeReviews = async (reviewsText: string): Promise<AnalysisResult> => {
  if (!apiKey) throw new Error("API Key not found");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Analyze the following customer reviews. 
      You need to identify the sentiment trend over the text (assuming chronological order if not specified), 
      extract the most frequent praise and complaint keywords for a word cloud, 
      and write a professional executive summary.
      
      Reviews:
      ${reviewsText.substring(0, 50000)} // Truncate to avoid context limits if extremely large, though 2.5/3 pro has huge context.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        thinkingConfig: {
            thinkingBudget: 32768, // Max thinking for deep analysis
        }
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("No response generated");
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const createChatSession = (contextData: AnalysisResult | null) => {
  if (!apiKey) throw new Error("API Key not found");

  const systemInstruction = `You are a helpful data analyst assistant for the "Sentient" dashboard. 
  You have access to the current analysis of customer reviews.
  
  Current Analysis Context:
  - Executive Summary: ${contextData?.executiveSummary || "No analysis loaded yet."}
  - Top Issues: ${contextData?.topActionableAreas.join(", ") || "N/A"}
  - Overall Score: ${contextData?.overallSentiment || "N/A"}

  Answer questions specifically about this data. Be concise and professional.
  If the user asks about something not in the data, explain that you only have access to the summary provided.`;

  return ai.chats.create({
    model: "gemini-3-pro-preview",
    config: {
      systemInstruction,
      thinkingConfig: {
        thinkingBudget: 4096 // Lower budget for quick chat responses, but still smart
      }
    }
  });
};
