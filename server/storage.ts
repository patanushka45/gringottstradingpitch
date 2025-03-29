import { 
  users, type User, type InsertUser,
  portfolioStocks, type PortfolioStock, type InsertPortfolioStock,
  watchlistStocks, type WatchlistStock, type InsertWatchlistStock,
  marketIndices, type MarketIndex, type InsertMarketIndex
} from "@shared/schema";

// Storage interface with CRUD methods for our data models
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Portfolio methods
  getPortfolioStocks(userId: number): Promise<PortfolioStock[]>;
  getPortfolioStock(id: number): Promise<PortfolioStock | undefined>;
  createPortfolioStock(stock: InsertPortfolioStock): Promise<PortfolioStock>;
  updatePortfolioStock(id: number, stock: Partial<InsertPortfolioStock>): Promise<PortfolioStock | undefined>;
  deletePortfolioStock(id: number): Promise<boolean>;
  
  // Watchlist methods
  getWatchlistStocks(userId: number): Promise<WatchlistStock[]>;
  getWatchlistStock(id: number): Promise<WatchlistStock | undefined>;
  createWatchlistStock(stock: InsertWatchlistStock): Promise<WatchlistStock>;
  deleteWatchlistStock(id: number): Promise<boolean>;
  
  // Market index methods
  getMarketIndices(): Promise<MarketIndex[]>;
  updateMarketIndex(name: string, data: Partial<InsertMarketIndex>): Promise<MarketIndex | undefined>;
  createMarketIndex(index: InsertMarketIndex): Promise<MarketIndex>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private portfolioStocks: Map<number, PortfolioStock>;
  private watchlistStocks: Map<number, WatchlistStock>;
  private marketIndices: Map<string, MarketIndex>;
  
  private userIdCounter: number;
  private portfolioStockIdCounter: number;
  private watchlistStockIdCounter: number;
  private marketIndexIdCounter: number;

  constructor() {
    this.users = new Map();
    this.portfolioStocks = new Map();
    this.watchlistStocks = new Map();
    this.marketIndices = new Map();
    
    this.userIdCounter = 1;
    this.portfolioStockIdCounter = 1;
    this.watchlistStockIdCounter = 1;
    this.marketIndexIdCounter = 1;
    
    // Initialize with demo user and data
    this.initializeDemo();
  }

  private initializeDemo() {
    // Create demo user
    const demoUser: User = {
      id: this.userIdCounter++,
      username: "demo",
      password: "password", // In a real app, this would be hashed
    };
    this.users.set(demoUser.id, demoUser);
    
    // Initialize market indices
    const indices = [
      { name: "S&P 500", value: 4682.80, change: 53.24, changePercent: 1.15 },
      { name: "NASDAQ", value: 15362.90, change: 270.02, changePercent: 1.79 },
      { name: "DOW", value: 36432.22, change: 246.76, changePercent: 0.68 },
      { name: "RUSSELL 2000", value: 2243.10, change: -4.97, changePercent: -0.22 },
      { name: "10-YR YIELD", value: 1.45, change: 0.05, changePercent: 3.57 },
      { name: "VIX", value: 16.48, change: -1.02, changePercent: -5.83 }
    ];
    
    indices.forEach(idx => {
      const marketIndex: MarketIndex = {
        id: this.marketIndexIdCounter++,
        name: idx.name,
        value: idx.value as any, // Convert to the correct Decimal type in a real DB
        change: idx.change as any,
        changePercent: idx.changePercent as any,
        lastUpdated: new Date(),
      };
      this.marketIndices.set(marketIndex.name, marketIndex);
    });
    
    // Add some portfolio stocks for the demo user
    const portfolioStocks = [
      { symbol: "AAPL", name: "Apple Inc.", shares: 12, purchasePrice: 150.25 },
      { symbol: "MSFT", name: "Microsoft", shares: 8, purchasePrice: 330.75 },
      { symbol: "TSLA", name: "Tesla, Inc.", shares: 5, purchasePrice: 950.53 },
      { symbol: "AMZN", name: "Amazon", shares: 3, purchasePrice: 3350.50 }
    ];
    
    portfolioStocks.forEach(stock => {
      const portfolioStock: PortfolioStock = {
        id: this.portfolioStockIdCounter++,
        userId: demoUser.id,
        symbol: stock.symbol,
        name: stock.name,
        shares: stock.shares as any,
        purchasePrice: stock.purchasePrice as any,
        purchaseDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in the last 30 days
      };
      this.portfolioStocks.set(portfolioStock.id, portfolioStock);
    });
    
    // Add some watchlist stocks for the demo user
    const watchlistStocks = [
      { symbol: "GOOG", name: "Alphabet Inc." },
      { symbol: "NFLX", name: "Netflix Inc." },
      { symbol: "JPM", name: "JPMorgan Chase" },
      { symbol: "DIS", name: "Disney" }
    ];
    
    watchlistStocks.forEach(stock => {
      const watchlistStock: WatchlistStock = {
        id: this.watchlistStockIdCounter++,
        userId: demoUser.id,
        symbol: stock.symbol,
        name: stock.name,
      };
      this.watchlistStocks.set(watchlistStock.id, watchlistStock);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Portfolio methods
  async getPortfolioStocks(userId: number): Promise<PortfolioStock[]> {
    return Array.from(this.portfolioStocks.values()).filter(
      stock => stock.userId === userId
    );
  }

  async getPortfolioStock(id: number): Promise<PortfolioStock | undefined> {
    return this.portfolioStocks.get(id);
  }

  async createPortfolioStock(stock: InsertPortfolioStock): Promise<PortfolioStock> {
    const id = this.portfolioStockIdCounter++;
    const portfolioStock: PortfolioStock = { ...stock, id };
    this.portfolioStocks.set(id, portfolioStock);
    return portfolioStock;
  }

  async updatePortfolioStock(id: number, stockUpdate: Partial<InsertPortfolioStock>): Promise<PortfolioStock | undefined> {
    const stock = this.portfolioStocks.get(id);
    if (!stock) return undefined;
    
    const updatedStock: PortfolioStock = { ...stock, ...stockUpdate };
    this.portfolioStocks.set(id, updatedStock);
    return updatedStock;
  }

  async deletePortfolioStock(id: number): Promise<boolean> {
    return this.portfolioStocks.delete(id);
  }

  // Watchlist methods
  async getWatchlistStocks(userId: number): Promise<WatchlistStock[]> {
    return Array.from(this.watchlistStocks.values()).filter(
      stock => stock.userId === userId
    );
  }

  async getWatchlistStock(id: number): Promise<WatchlistStock | undefined> {
    return this.watchlistStocks.get(id);
  }

  async createWatchlistStock(stock: InsertWatchlistStock): Promise<WatchlistStock> {
    const id = this.watchlistStockIdCounter++;
    const watchlistStock: WatchlistStock = { ...stock, id };
    this.watchlistStocks.set(id, watchlistStock);
    return watchlistStock;
  }

  async deleteWatchlistStock(id: number): Promise<boolean> {
    return this.watchlistStocks.delete(id);
  }

  // Market index methods
  async getMarketIndices(): Promise<MarketIndex[]> {
    return Array.from(this.marketIndices.values());
  }

  async updateMarketIndex(name: string, data: Partial<InsertMarketIndex>): Promise<MarketIndex | undefined> {
    const index = this.marketIndices.get(name);
    if (!index) return undefined;
    
    const updatedIndex: MarketIndex = { ...index, ...data };
    this.marketIndices.set(name, updatedIndex);
    return updatedIndex;
  }

  async createMarketIndex(indexData: InsertMarketIndex): Promise<MarketIndex> {
    const id = this.marketIndexIdCounter++;
    const marketIndex: MarketIndex = { ...indexData, id };
    this.marketIndices.set(marketIndex.name, marketIndex);
    return marketIndex;
  }
}

export const storage = new MemStorage();
