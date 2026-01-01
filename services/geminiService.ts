import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
import { TRUTHCART_SYSTEM_PROMPT } from "../constants";
import { AnalysisResult, ProductInput } from "../types";

// Initialize the Gemini API client
// Note: process.env.API_KEY is assumed to be available in the build environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeProduct = async (input: ProductInput): Promise<AnalysisResult> => {
  const isDeep = input.mode === 'deep';
  
  // Use Gemini 3 Pro for deep research with thinking, Gemini 3 Flash for fast scans (with Search)
  const modelId = isDeep ? "gemini-3-pro-preview" : "gemini-3-flash-preview";

  const userPrompt = `
    Analyze the following product:
    Product Name: ${input.name}
    Brand Name: ${input.brand || "Unknown"}
    Product URL: ${input.url}
    
    Return the analysis in the strict JSON format defined in your system instructions.
  `;

  // Base config with schema
  const config: any = {
    systemInstruction: TRUTHCART_SYSTEM_PROMPT,
    responseMimeType: "application/json",
    tools: [{googleSearch: {}}],
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        product_name: { type: Type.STRING },
        brand_name: { type: Type.STRING, nullable: true },
        product_url: { type: Type.STRING },
        external_data_status: { type: Type.STRING, enum: ["ok", "insufficient_data"] },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              source: { type: Type.STRING, enum: ["reddit", "x", "youtube"] },
              url: { type: Type.STRING, nullable: true },
              text: { type: Type.STRING },
              date: { type: Type.STRING, nullable: true },
              sentiment: { type: Type.STRING, enum: ["positive", "mixed", "negative"] },
              sentiment_score: { type: Type.NUMBER },
              contains_sponsored_language: { type: Type.BOOLEAN },
            },
          },
        },
        external_norm: { type: Type.NUMBER, nullable: true },
        trust_score: { type: Type.NUMBER },
        status: { type: Type.STRING, enum: ["Trusted", "Mixed", "Suspicious"] },
        breakdown: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              metric: { type: Type.STRING },
              weight_pct: { type: Type.NUMBER },
              penalty: { type: Type.NUMBER },
            },
          },
        },
        red_flags: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              flag: { type: Type.STRING },
              severity: { type: Type.STRING, enum: ["low", "medium", "high"] },
              detail: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
          },
        },
        top_quotes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              source: { type: Type.STRING },
              url: { type: Type.STRING, nullable: true },
              sentiment: { type: Type.STRING, enum: ["positive", "mixed", "negative"] },
            },
          },
        },
        badge_text: { type: Type.STRING },
        status_text: { type: Type.STRING },
        score_explanation: { type: Type.STRING },
        quote_snippets: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING },
                    source: { type: Type.STRING },
                    sentiment: { type: Type.STRING, enum: ["positive", "mixed", "negative"] },
                }
            }
        },
        red_flag_bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
        loading_text: { type: Type.STRING },
        fallback_text: { type: Type.STRING },
        verdict: { type: Type.STRING },
        dominant_complaint: { type: Type.STRING },
        key_insight: { type: Type.STRING },
        confidence_level: { type: Type.STRING, enum: ["High Confidence", "Medium Confidence", "Low Confidence"] },
        confidence_explanation: { type: Type.STRING },
      },
      required: ["product_name", "trust_score", "status", "breakdown", "red_flags", "verdict", "dominant_complaint", "key_insight", "confidence_level", "confidence_explanation"],
    },
  };

  // Add Thinking Config only for deep mode (Gemini 3 Pro)
  if (isDeep) {
    config.thinkingConfig = { thinkingBudget: 32768 };
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: userPrompt,
      config: config,
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    const json = JSON.parse(text) as AnalysisResult;

    // Extract grounding URLs if available
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      json.grounding_urls = response.candidates[0].groundingMetadata.groundingChunks
        .map((c: any) => c.web?.uri)
        .filter((u: string) => u);
    }

    return json;
  } catch (error) {
    console.error("Analysis failed", error);
    throw error;
  }
};

export const generateMarketingImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${base64EncodeString}`;
      }
    }
    
    throw new Error("No image generated");
  } catch (error) {
    console.error("Image generation failed", error);
    throw error;
  }
};