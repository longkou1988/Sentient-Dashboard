export enum SentimentType {
  POSITIVE = 'POSITIVE',
  NEGATIVE = 'NEGATIVE',
  NEUTRAL = 'NEUTRAL'
}

export interface WordCloudItem {
  text: string;
  value: number; // Frequency
  sentiment: SentimentType;
}

export interface SentimentDataPoint {
  index: number;
  label: string; // e.g., "Review 1-10", "Week 1"
  sentimentScore: number; // -1 to 1
}

export interface AnalysisResult {
  executiveSummary: string;
  topActionableAreas: string[];
  sentimentTrend: SentimentDataPoint[];
  wordCloud: WordCloudItem[];
  overallSentiment: number; // -100 to 100
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
}