// Stock data types for API responses

// Alpha Vantage Global Quote response
export interface StockQuote {
  "Global Quote": {
    "01. symbol": string;
    "02. open": string;
    "03. high": string;
    "04. low": string;
    "05. price": string;
    "06. volume": string;
    "07. latest trading day": string;
    "08. previous close": string;
    "09. change": string;
    "10. change percent": string;
  };
}

// Alpha Vantage Search response
export interface StockSearchResult {
  bestMatches: {
    "1. symbol": string;
    "2. name": string;
    "3. type": string;
    "4. region": string;
    "5. marketOpen": string;
    "6. marketClose": string;
    "7. timezone": string;
    "8. currency": string;
    "9. matchScore": string;
  }[];
}

// Alpha Vantage Time Series responses
export interface TimeSeriesData {
  "Meta Data": {
    "1. Information": string;
    "2. Symbol": string;
    "3. Last Refreshed": string;
    "4. Interval"?: string;
    "5. Output Size"?: string;
    "6. Time Zone": string;
  };
  [key: string]: any; // Time series data with variable key name
}

// Alpha Vantage News response
export interface NewsResponse {
  feed: {
    title: string;
    url: string;
    summary: string;
    banner_image?: string;
    source: string;
    source_domain: string;
    time_published: string;
    topics: {
      topic: string;
      relevance_score: string;
    }[];
  }[];
  pagination: {
    count: number;
    limit: number;
    offset: number;
  };
}

// Frontend stock display types
export interface StockSummary {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface StockPosition extends StockSummary {
  shares: number;
  purchasePrice: number;
  purchaseDate: Date;
  marketValue: number;
  costBasis: number;
  gainLoss: number;
  gainLossPercent: number;
  dayChange: number;
}

export interface MarketIndexSummary {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface ChartPoint {
  date: string;
  value: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
}
