import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table with basic authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Portfolio stocks table
export const portfolioStocks = pgTable("portfolio_stocks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  shares: numeric("shares").notNull(),
  purchasePrice: numeric("purchase_price").notNull(),
  purchaseDate: timestamp("purchase_date").notNull(),
});

export const insertPortfolioStockSchema = createInsertSchema(portfolioStocks).pick({
  userId: true,
  symbol: true,
  name: true,
  shares: true,
  purchasePrice: true,
  purchaseDate: true,
});

// Watchlist stocks table
export const watchlistStocks = pgTable("watchlist_stocks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
});

export const insertWatchlistStockSchema = createInsertSchema(watchlistStocks).pick({
  userId: true,
  symbol: true,
  name: true,
});

// Market index table to store latest market indices
export const marketIndices = pgTable("market_indices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  value: numeric("value").notNull(),
  change: numeric("change").notNull(),
  changePercent: numeric("change_percent").notNull(),
  lastUpdated: timestamp("last_updated").notNull(),
});

export const insertMarketIndexSchema = createInsertSchema(marketIndices).pick({
  name: true,
  value: true,
  change: true,
  changePercent: true,
  lastUpdated: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type PortfolioStock = typeof portfolioStocks.$inferSelect;
export type InsertPortfolioStock = z.infer<typeof insertPortfolioStockSchema>;

export type WatchlistStock = typeof watchlistStocks.$inferSelect;
export type InsertWatchlistStock = z.infer<typeof insertWatchlistStockSchema>;

export type MarketIndex = typeof marketIndices.$inferSelect;
export type InsertMarketIndex = z.infer<typeof insertMarketIndexSchema>;
