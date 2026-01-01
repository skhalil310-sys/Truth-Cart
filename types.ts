
export type Source = 'reddit' | 'x' | 'youtube';
export type Sentiment = 'positive' | 'mixed' | 'negative';
export type Status = 'Trusted' | 'Mixed' | 'Suspicious';
export type Severity = 'low' | 'medium' | 'high';
export type AnalysisMode = 'fast' | 'deep';
export type ConfidenceLevel = 'High Confidence' | 'Medium Confidence' | 'Low Confidence';

export interface Item {
  source: Source;
  url: string | null;
  text: string;
  date: string | null;
  sentiment: Sentiment;
  sentiment_score: number;
  contains_sponsored_language: boolean;
}

export interface BreakdownMetric {
  metric: string;
  weight_pct: number;
  penalty: number;
}

export interface RedFlag {
  flag: string;
  severity: Severity;
  detail: string;
  explanation: string;
}

export interface QuoteSnippet {
  text: string;
  source: Source;
  url?: string | null;
  sentiment: Sentiment;
}

export interface AnalysisResult {
  product_name: string;
  brand_name: string | null;
  product_url: string;
  external_data_status: 'ok' | 'insufficient_data';
  items: Item[];
  external_norm: number | null;
  trust_score: number;
  status: Status;
  breakdown: BreakdownMetric[];
  red_flags: RedFlag[];
  top_quotes: QuoteSnippet[];
  badge_text: string;
  status_text: string;
  score_explanation: string;
  quote_snippets: QuoteSnippet[];
  red_flag_bullets: string[];
  loading_text: string;
  fallback_text: string;
  verdict: string;
  dominant_complaint: string;
  key_insight: string;
  confidence_level: ConfidenceLevel;
  confidence_explanation: string;
  grounding_urls?: string[];
}

export interface ProductInput {
  name: string;
  brand: string;
  url: string;
  mode: AnalysisMode;
}