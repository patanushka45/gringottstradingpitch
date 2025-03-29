import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { insertPortfolioStockSchema, insertWatchlistStockSchema } from "@shared/schema";
import { z } from "zod";
import yahooFinance from "yahoo-finance2";

// Log which API we're using
console.log("Using Yahoo Finance API for stock data");

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiPrefix = "/api";

  // Market data endpoints
  app.get(`${apiPrefix}/market/indices`, async (req, res) => {
    try {
      const indices = await storage.getMarketIndices();
      res.json(indices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market indices" });
    }
  });

  // Stock search endpoint with Yahoo Finance
  app.get(`${apiPrefix}/stocks/search`, async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Query parameter q is required" });
      }

      const results = await yahooFinance.search(query);
      
      // Transform the results to match the structure expected by the frontend
      const transformedResults = {
        bestMatches: results.quotes.map(quote => {
          // Handle different quote types safely with type assertions
          const symbol = (quote as any).symbol || "";
          const name = (quote as any).shortname || (quote as any).longname || "";
          const type = (quote as any).quoteType || "Equity";
          const region = (quote as any).exchange || "US";
          const currency = (quote as any).currency || "USD";
          
          return {
            "1. symbol": symbol,
            "2. name": name,
            "3. type": type,
            "4. region": region,
            "5. marketOpen": "09:30",
            "6. marketClose": "16:00",
            "7. timezone": "UTC-5",
            "8. currency": currency,
            "9. matchScore": "1.0"
          };
        })
      };
      
      res.json(transformedResults);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Failed to search stocks" });
    }
  });

  // Stock quote endpoint
  app.get(`${apiPrefix}/stocks/quote/:symbol`, async (req, res) => {
    try {
      const { symbol } = req.params;
      
      const quote = await yahooFinance.quote(symbol);
      
      if (!quote) {
        return res.status(404).json({ message: "Stock not found" });
      }
      
      // Transform the Yahoo Finance response to match the structure expected by the frontend
      const transformedData = {
        "Global Quote": {
          "01. symbol": quote.symbol,
          "02. open": quote.regularMarketOpen?.toString() || "0",
          "03. high": quote.regularMarketDayHigh?.toString() || "0",
          "04. low": quote.regularMarketDayLow?.toString() || "0",
          "05. price": quote.regularMarketPrice?.toString() || "0",
          "06. volume": quote.regularMarketVolume?.toString() || "0",
          "07. latest trading day": new Date().toISOString().split('T')[0],
          "08. previous close": quote.regularMarketPreviousClose?.toString() || "0",
          "09. change": quote.regularMarketChange?.toString() || "0",
          "10. change percent": `${(quote.regularMarketChangePercent || 0) * 100}%`
        }
      };
      
      res.json(transformedData);
    } catch (error) {
      console.error("Quote error:", error);
      res.status(500).json({ message: "Failed to fetch stock quote" });
    }
  });

  // Stock intraday data endpoint
  app.get(`${apiPrefix}/stocks/intraday/:symbol`, async (req, res) => {
    try {
      const { symbol } = req.params;
      const intervalParam = req.query.interval as string || "5m";
      
      // Convert interval to Yahoo Finance format if needed
      let yInterval = intervalParam.replace('min', 'm');
      if (yInterval === "1m" || yInterval === "2m" || yInterval === "5m" || 
          yInterval === "15m" || yInterval === "30m" || yInterval === "60m" || 
          yInterval === "1h" || yInterval === "1d") {
        // Valid Yahoo Finance interval
      } else {
        // Default to 5m if invalid
        yInterval = "5m";
      }
      
      const historicalData = await yahooFinance.historical(symbol, {
        period1: new Date(new Date().setDate(new Date().getDate() - 1)),  // Yesterday
        period2: new Date(),  // Today
        interval: yInterval as any
      });
      
      // Transform the Yahoo Finance response to match the structure expected by the frontend
      const formattedData: any = {
        "Meta Data": {
          "1. Information": `Intraday Time Series with ${yInterval} interval`,
          "2. Symbol": symbol,
          "3. Last Refreshed": new Date().toISOString(),
          "4. Interval": yInterval,
          "5. Output Size": "Compact",
          "6. Time Zone": "US/Eastern"
        },
        [`Time Series (${yInterval})`]: {}
      };
      
      historicalData.forEach(bar => {
        const timestamp = bar.date.toISOString().replace('T', ' ').split('.')[0];
        formattedData[`Time Series (${yInterval})`][timestamp] = {
          "1. open": bar.open?.toString() || "0",
          "2. high": bar.high?.toString() || "0",
          "3. low": bar.low?.toString() || "0",
          "4. close": bar.close?.toString() || "0",
          "5. volume": bar.volume?.toString() || "0"
        };
      });
      
      res.json(formattedData);
    } catch (error) {
      console.error("Historical data error:", error);
      res.status(500).json({ message: "Failed to fetch intraday data" });
    }
  });

  // Stock daily data endpoint
  app.get(`${apiPrefix}/stocks/daily/:symbol`, async (req, res) => {
    try {
      const { symbol } = req.params;
      
      const historicalData = await yahooFinance.historical(symbol, {
        period1: new Date(new Date().setDate(new Date().getDate() - 30)),  // Last 30 days
        period2: new Date(),  // Today
        interval: "1d"
      });
      
      // Transform the Yahoo Finance response to match the structure expected by the frontend
      const formattedData: any = {
        "Meta Data": {
          "1. Information": "Daily Time Series",
          "2. Symbol": symbol,
          "3. Last Refreshed": new Date().toISOString().split('T')[0],
          "4. Output Size": "Compact",
          "5. Time Zone": "US/Eastern"
        },
        "Time Series (Daily)": {}
      };
      
      historicalData.forEach(bar => {
        const timestamp = bar.date.toISOString().split('T')[0];
        formattedData["Time Series (Daily)"][timestamp] = {
          "1. open": bar.open?.toString() || "0",
          "2. high": bar.high?.toString() || "0",
          "3. low": bar.low?.toString() || "0",
          "4. close": bar.close?.toString() || "0",
          "5. volume": bar.volume?.toString() || "0"
        };
      });
      
      res.json(formattedData);
    } catch (error) {
      console.error("Daily data error:", error);
      res.status(500).json({ message: "Failed to fetch daily data" });
    }
  });

  // Stock weekly data endpoint
  app.get(`${apiPrefix}/stocks/weekly/:symbol`, async (req, res) => {
    try {
      const { symbol } = req.params;
      
      const historicalData = await yahooFinance.historical(symbol, {
        period1: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),  // Last year
        period2: new Date(),  // Today
        interval: "1wk"
      });
      
      // Transform the Yahoo Finance response to match the structure expected by the frontend
      const formattedData: any = {
        "Meta Data": {
          "1. Information": "Weekly Time Series",
          "2. Symbol": symbol,
          "3. Last Refreshed": new Date().toISOString().split('T')[0],
          "4. Time Zone": "US/Eastern"
        },
        "Weekly Time Series": {}
      };
      
      historicalData.forEach(bar => {
        const timestamp = bar.date.toISOString().split('T')[0];
        formattedData["Weekly Time Series"][timestamp] = {
          "1. open": bar.open?.toString() || "0",
          "2. high": bar.high?.toString() || "0",
          "3. low": bar.low?.toString() || "0",
          "4. close": bar.close?.toString() || "0",
          "5. volume": bar.volume?.toString() || "0"
        };
      });
      
      res.json(formattedData);
    } catch (error) {
      console.error("Weekly data error:", error);
      res.status(500).json({ message: "Failed to fetch weekly data" });
    }
  });

  // Stock monthly data endpoint
  app.get(`${apiPrefix}/stocks/monthly/:symbol`, async (req, res) => {
    try {
      const { symbol } = req.params;
      
      const historicalData = await yahooFinance.historical(symbol, {
        period1: new Date(new Date().setFullYear(new Date().getFullYear() - 5)),  // Last 5 years
        period2: new Date(),  // Today
        interval: "1mo"
      });
      
      // Transform the Yahoo Finance response to match the structure expected by the frontend
      const formattedData: any = {
        "Meta Data": {
          "1. Information": "Monthly Time Series",
          "2. Symbol": symbol,
          "3. Last Refreshed": new Date().toISOString().split('T')[0],
          "4. Time Zone": "US/Eastern"
        },
        "Monthly Time Series": {}
      };
      
      historicalData.forEach(bar => {
        const timestamp = bar.date.toISOString().split('T')[0];
        formattedData["Monthly Time Series"][timestamp] = {
          "1. open": bar.open?.toString() || "0",
          "2. high": bar.high?.toString() || "0",
          "3. low": bar.low?.toString() || "0",
          "4. close": bar.close?.toString() || "0",
          "5. volume": bar.volume?.toString() || "0"
        };
      });
      
      res.json(formattedData);
    } catch (error) {
      console.error("Monthly data error:", error);
      res.status(500).json({ message: "Failed to fetch monthly data" });
    }
  });

  // Portfolio endpoints
  app.get(`${apiPrefix}/portfolio`, async (req, res) => {
    try {
      // Using demo user (id: 1) for this example
      const userId = 1;
      const portfolioStocks = await storage.getPortfolioStocks(userId);
      res.json(portfolioStocks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch portfolio stocks" });
    }
  });

  app.post(`${apiPrefix}/portfolio`, async (req, res) => {
    try {
      // Validate request body
      const result = insertPortfolioStockSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request body", errors: result.error.format() });
      }
      
      const portfolioStock = await storage.createPortfolioStock(result.data);
      res.status(201).json(portfolioStock);
    } catch (error) {
      res.status(500).json({ message: "Failed to create portfolio stock" });
    }
  });

  app.delete(`${apiPrefix}/portfolio/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const deleted = await storage.deletePortfolioStock(id);
      if (!deleted) {
        return res.status(404).json({ message: "Portfolio stock not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete portfolio stock" });
    }
  });

  // Watchlist endpoints
  app.get(`${apiPrefix}/watchlist`, async (req, res) => {
    try {
      // Using demo user (id: 1) for this example
      const userId = 1;
      const watchlistStocks = await storage.getWatchlistStocks(userId);
      res.json(watchlistStocks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch watchlist stocks" });
    }
  });

  app.post(`${apiPrefix}/watchlist`, async (req, res) => {
    try {
      // Validate request body
      const result = insertWatchlistStockSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request body", errors: result.error.format() });
      }
      
      const watchlistStock = await storage.createWatchlistStock(result.data);
      res.status(201).json(watchlistStock);
    } catch (error) {
      res.status(500).json({ message: "Failed to create watchlist stock" });
    }
  });

  app.delete(`${apiPrefix}/watchlist/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const deleted = await storage.deleteWatchlistStock(id);
      if (!deleted) {
        return res.status(404).json({ message: "Watchlist stock not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete watchlist stock" });
    }
  });

  // Market news endpoint using Yahoo Finance
  app.get(`${apiPrefix}/market/news`, async (req, res) => {
    try {
      // Use a fixed list of popular stocks since trendingStocks might not be available
      const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
      
      // Fetch news for these popular stocks
      const newsPromises = symbols.map(symbol => yahooFinance.search(symbol));
      const newsResults = await Promise.all(newsPromises);
      
      // Transform to Alpha Vantage format
      const transformedNews = {
        feed: newsResults.flatMap((result: any, index: number) => {
          const symbol = symbols[index];
          return ((result.news || []) as any[]).slice(0, 2).map((item: any) => ({
            title: item.title || `Market News for ${symbol}`,
            summary: item.summary || 'Market updates and financial news',
            url: item.link || 'https://finance.yahoo.com',
            banner_image: item.thumbnail?.resolutions?.[0]?.url || '',
            source: item.publisher || 'Yahoo Finance',
            source_domain: 'finance.yahoo.com',
            time_published: new Date((item.providerPublishTime || Date.now()) * 1000).toISOString(),
            topics: [{ 
              topic: symbol, 
              relevance_score: "1.0" 
            }]
          }));
        })
      };
      
      res.json(transformedNews);
    } catch (error) {
      console.error("News error:", error);
      
      // If Yahoo Finance news failed, return some default format to keep the UI working
      const defaultNews = {
        feed: [
          {
            title: "Markets Today: Wizarding Finance Update",
            summary: "The market is experiencing changes as various magical companies adjust to the new economic climate.",
            url: "https://finance.yahoo.com",
            source: "Magic Financial Times",
            source_domain: "finance.yahoo.com",
            time_published: new Date().toISOString(),
            topics: [{ topic: "Markets", relevance_score: "1.0" }]
          }
        ]
      };
      
      res.json(defaultNews);
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
