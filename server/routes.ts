import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { insertPortfolioStockSchema, insertWatchlistStockSchema } from "@shared/schema";
import { z } from "zod";

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "demo";

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

  // Stock search endpoint with Alpha Vantage
  app.get(`${apiPrefix}/stocks/search`, async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Query parameter q is required" });
      }

      const response = await axios.get(
        `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ message: "Failed to search stocks" });
    }
  });

  // Stock quote endpoint
  app.get(`${apiPrefix}/stocks/quote/:symbol`, async (req, res) => {
    try {
      const { symbol } = req.params;
      
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      
      if (response.data["Error Message"]) {
        return res.status(404).json({ message: "Stock not found" });
      }
      
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock quote" });
    }
  });

  // Stock intraday data endpoint
  app.get(`${apiPrefix}/stocks/intraday/:symbol`, async (req, res) => {
    try {
      const { symbol } = req.params;
      const interval = req.query.interval || "5min";
      
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      
      if (response.data["Error Message"]) {
        return res.status(404).json({ message: "Stock not found" });
      }
      
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch intraday data" });
    }
  });

  // Stock daily data endpoint
  app.get(`${apiPrefix}/stocks/daily/:symbol`, async (req, res) => {
    try {
      const { symbol } = req.params;
      
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      
      if (response.data["Error Message"]) {
        return res.status(404).json({ message: "Stock not found" });
      }
      
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch daily data" });
    }
  });

  // Stock weekly data endpoint
  app.get(`${apiPrefix}/stocks/weekly/:symbol`, async (req, res) => {
    try {
      const { symbol } = req.params;
      
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      
      if (response.data["Error Message"]) {
        return res.status(404).json({ message: "Stock not found" });
      }
      
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly data" });
    }
  });

  // Stock monthly data endpoint
  app.get(`${apiPrefix}/stocks/monthly/:symbol`, async (req, res) => {
    try {
      const { symbol } = req.params;
      
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      
      if (response.data["Error Message"]) {
        return res.status(404).json({ message: "Stock not found" });
      }
      
      res.json(response.data);
    } catch (error) {
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

  // Market news endpoint
  app.get(`${apiPrefix}/market/news`, async (req, res) => {
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market news" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
