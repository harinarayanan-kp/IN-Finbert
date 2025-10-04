// Groww-specific types
export interface GrowwCompany {
  isin: string;
  companyName: string;
  companyShortName: string;
  nseScripCode: string;
  bseScripCode: string;
  bseScriptGroup: string | null;
  imageUrl: string;
  blogUrl: string;
  searchId: string;
  livePriceDto: {
    type: string;
    symbol: string;
    tsInMillis: number;
    open: number;
    high: number;
    low: number;
    close: number;
    ltp: number;
    dayChange: number;
    dayChangePerc: number;
    lowPriceRange: number;
    highPriceRange: number;
    volume: number;
    totalBuyQty: number;
    totalSellQty: number;
    oiDayChange: number;
    oiDayChangePerc: number;
    lastTradeQty: number;
    lastTradeTime: number;
  };
  liveIndicesDto: any;
}

export interface NewsItem {
  url: string;
  title: string;
  timestamp: string;
  description: string;
  companies?: GrowwCompany[]; // Optional for Groww news items
  source?: string; // Optional source field
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

export interface SentimentResult {
  sentiment: string;
  confidence?: number;
  scores?: {
    [key: string]: number;
  };
}

export interface GrowwNewsItem extends NewsItem {
  id: string;
  summary: string;
  imageUrl: string;
  contifyImageUrl: string;
  source: string;
  companies: GrowwCompany[];
  topics: string[];
  hidden: boolean;
}
