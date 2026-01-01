import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TRUTHCART_SYSTEM_PROMPT = `
You are TruthCart: a pipeline that, given a product name, brand, and product URL, must return a compact JSON analysis. DO NOT invent or hallucinate quotes — only use public items. The final JSON must exactly follow the schema at the end of this prompt.

STEP A — Community Data Aggregation:
- You are the Community Aggregator.
- Task: Fetch up to 100 public posts/comments about the product from Reddit, X, and YouTube.
- Use Google Search to find real, recent discussions if available.
- For each item include:
  - source: "reddit" | "x" | "youtube"
  - url: direct link (if available)
  - text: cleaned text limited to 140 characters (trim without losing meaning)
  - date: ISO date YYYY-MM-DD
  - sentiment: "positive" | "mixed" | "negative"
  - sentiment_score: float between -1 (very negative) and +1 (very positive)
  - contains_sponsored_language: true|false (detect "sponsored", "affiliate", "promo code", "free product", "gifted", etc.)
- Compute external_norm: average sentiment_score across items, weighted by recency (more recent = 1.5x weight for items within 90 days).
- If you cannot access live web or find no data, return items=[], external_data_status:"insufficient_data".

STEP B — Review & Product Metadata (optional inputs)
- If provided, use official product rating (avg_rating numeric 1–5) and rating_count. If not provided, assume unknown and continue.

STEP C — Trust Score calculation (Trust Score Engine):
- Act as the Trust Score Engine.
- Input: The aggregation results from Step A and available product metadata.
- Task: Compute trust_score (0..100).
- Logic:
  Compute penalties p1..p5 in range 0..1:
  1. p1 External Sentiment Mismatch (weight 35%): compare official rating normalized to -1..+1 with external_norm; compute absolute difference and scale to penalty.
  2. p2 Sponsored/Affiliate Language Frequency (20%): ratio of items with contains_sponsored_language to total items (or 0 if no items).
  3. p3 Review Timing Anomalies (20%): detect if there are review spikes (many reviews/comments concentrated in short windows). If you don't have timestamped review data, set p3=0 (cannot detect).
  4. p4 External Complaints (15%): normalized count of negative items vs expected volume; if no items, p4=0.
  5. p5 Reviewer Diversity (10%): if many items come from few unique accounts or comments are near-duplicates, increase penalty; if cannot detect, set p5=0.

- Calculation: weighted_penalty = 0.35*p1 + 0.20*p2 + 0.20*p3 + 0.15*p4 + 0.10*p5
- trust_score = round((1 - weighted_penalty) * 100)
- status: "Trusted" if trust_score >= 70, "Mixed" if 40 <= trust_score < 70, "Suspicious" if trust_score < 40

STEP D — Red Flags detection:
- Return breakdown and red_flags array.
- Detect discrete red flags with severity ("low"|"medium"|"high") and short detail. Examples to detect:
  - "Sudden 5★ spike"
  - "Affiliate-heavy language"
  - "Copy-pasted reviews"
  - "Generic praise"
  - "Multiple refund/complaint reports"
- For each red flag, include an "explanation" field: a 1-sentence buyer-focused "Why this matters" explanation.
  - Rules: No fear-mongering, clear cause -> effect logic.
  - Example: "Paid or gifted reviews often exaggerate product quality."
- If you cannot detect any red flags from data, return [].

STEP E — UI Copy assembly (UX Writer):
- Act as the UX Writer.
- Tone: Trust-first, friendly, slightly cheeky.
- Constraint: All strings must be concise, clear, and readable in a small floating panel.
- Tasks:
  - badge_text: A short, punchy summary sentence explaining the score.
  - status_text: A descriptive label for the status.
  - quote_snippets: Select up to 3 most relevant user quotes (max 140 chars) to display.
    - IMPORTANT: Label each quote as "positive", "mixed", or "negative".
  - dominant_complaint: A 1-line summary of the most common negative point mentioned by users.
  - key_insight: A 1-line summary of the most helpful or trusted piece of feedback (positive or constructive).
  - red_flag_bullets: Array of short strings prefixed by emoji (🚩, ⚠️) based on detected flags.
  - loading_text: A witty loading message (e.g., "Crunching the truth...").
  - fallback_text: Message for insufficient data (e.g., "Not enough community discussion to judge this product.").
  - score_explanation: A friendly, concise multi-line summary explaining the score calculation.
  - verdict: A 1-2 sentence buying recommendation starting with "Verdict:". Be helpful, confident, and fair. Do not mention scoring formulas. Avoid "AI thinks".

STEP F — Confidence Assessment:
- Assess confidence in this analysis based on data volume, source variety, and consistency.
- levels: "High Confidence" (many items, multiple sources, consistent), "Medium Confidence", "Low Confidence" (few items, single source, or very old).
- explanation: 1 short sentence explaining why (e.g., "Based on 45 recent discussions across Reddit and YouTube.").

FINAL OUTPUT — Strict JSON Schema (no extra keys)
Return a single JSON document matching this exact structure. If any field is not computable due to missing data, fill with null or empty arrays and set "external_data_status":"insufficient_data".
`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { product_name, brand_name, product_url, mode = 'fast' } = req.body || {};

  if (!product_name || !product_url) {
    return res.status(400).json({ error: "Missing product_name or product_url" });
  }

  const isDeep = mode === 'deep';
  // Use Gemini 3 Pro for deep research with thinking, Gemini 3 Flash for fast scans (with Search)
  const modelId = isDeep ? "gemini-3-pro-preview" : "gemini-3-flash-preview";

  const config = {
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
      required: ["trust_score", "status", "red_flags", "verdict", "dominant_complaint", "key_insight", "confidence_level", "confidence_explanation"],
    },
  };

  if (isDeep) {
    config.thinkingConfig = { thinkingBudget: 32768 };
  }

  const userPrompt = `
    Analyze the following product:
    Product Name: ${product_name}
    Brand Name: ${brand_name || "Unknown"}
    Product URL: ${product_url}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: userPrompt,
      config: config
    });

    const json = JSON.parse(response.text);

    // Extract grounding URLs if available
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      json.grounding_urls = response.candidates[0].groundingMetadata.groundingChunks
        .map((c) => c.web?.uri)
        .filter((u) => u);
    }

    return res.status(200).json(json);
  } catch (err) {
    console.error("Gemini API Error:", err);
    return res.status(500).json({ error: "Analysis failed", detail: err.message });
  }
}