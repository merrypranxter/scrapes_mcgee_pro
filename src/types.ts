export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  type?: 'text' | 'scrape-result';
  suggestedFilename?: string;
  metadata?: {
    urls?: string[];
    format?: string;
    data?: any;
  };
}

export interface ScrapeOptions {
  depth: number;
  format: 'pdf' | 'txt' | 'md' | 'csv';
  focus?: string;
}
