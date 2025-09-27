export interface NewsItem {
  url: string;
  title: string;
  timestamp: string;
  description: string;
  sentiment?: {
    label: string;
    score: number;
    all_scores: {
      negative: number;
      neutral: number;
      positive: number;
    };
  };
}
