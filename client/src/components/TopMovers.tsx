import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPercent } from "../utils/formatters";
import { Link } from "wouter";

// Popular stock symbols for demonstration
const popularSymbols = [
  "AAPL", "MSFT", "AMZN", "GOOGL", "META", 
  "TSLA", "NVDA", "AMD", "NFLX", "JPM", 
  "BAC", "DIS", "PLTR", "SNAP", "UBER"
];

type StockMover = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
};

export default function TopMovers() {
  const [topMovers, setTopMovers] = useState<StockMover[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch quotes for the popular symbols
  const { data, isLoading: isQueryLoading, error } = useQuery({
    queryKey: ['/api/stocks/quotes/popular'],
    queryFn: async () => {
      const quotes: Record<string, any> = {};
      
      // Due to API rate limits, we need to fetch quotes one by one
      // and we'll only get a subset of stocks for demo purposes
      for (const symbol of popularSymbols.slice(0, 8)) {
        try {
          const response = await fetch(`/api/stocks/quote/${symbol}`);
          const data = await response.json();
          quotes[symbol] = data["Global Quote"] || null;
        } catch (error) {
          console.error(`Failed to fetch quote for ${symbol}:`, error);
        }
      }
      
      return quotes;
    },
  });

  // Process the quotes into a top movers list
  useEffect(() => {
    if (data) {
      const movers: StockMover[] = [];
      
      for (const [symbol, quote] of Object.entries(data)) {
        if (quote) {
          movers.push({
            symbol,
            name: getCompanyName(symbol), // Alpha Vantage doesn't provide company names in quotes
            price: parseFloat(quote["05. price"]),
            change: parseFloat(quote["09. change"]),
            changePercent: parseFloat(quote["10. change percent"].replace('%', '')),
          });
        }
      }
      
      // Sort by absolute percentage change to get the biggest movers
      movers.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
      
      setTopMovers(movers);
      setIsLoading(false);
    }
  }, [data]);

  if (isLoading || isQueryLoading) {
    return <TopMoversLoading />;
  }

  if (error || topMovers.length === 0) {
    return (
      <Card className="border border-neutral-200 mb-6">
        <CardHeader>
          <CardTitle>Top Movers Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <p className="text-neutral-600">Could not load top movers data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-neutral-200 mb-6">
      <CardHeader>
        <CardTitle>Top Movers Today</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex overflow-x-auto scrollbar-hide space-x-4 pb-4">
          {topMovers.map((stock) => (
            <div
              key={stock.symbol}
              className="min-w-[200px] flex-shrink-0 border border-neutral-200 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <Link href={`/stock/${stock.symbol}`}>
                  <a className="font-medium hover:text-primary">{stock.symbol}</a>
                </Link>
                <span 
                  className={`text-xs px-2 py-0.5 rounded-full
                    ${stock.changePercent >= 0 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'}`}
                >
                  {formatPercent(stock.changePercent)}
                </span>
              </div>
              <div className="text-sm text-neutral-600 mb-1">{stock.name}</div>
              <div className="text-sm font-medium">{formatCurrency(stock.price)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TopMoversLoading() {
  return (
    <Card className="border border-neutral-200 mb-6">
      <CardHeader>
        <CardTitle>Top Movers Today</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex overflow-x-auto scrollbar-hide space-x-4 pb-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="min-w-[200px] flex-shrink-0 border border-neutral-200 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get company names
// In a real app, this would come from an API
function getCompanyName(symbol: string): string {
  const companyNames: Record<string, string> = {
    AAPL: "Apple Inc.",
    MSFT: "Microsoft Corp.",
    AMZN: "Amazon.com Inc.",
    GOOGL: "Alphabet Inc.",
    META: "Meta Platforms Inc.",
    TSLA: "Tesla Inc.",
    NVDA: "NVIDIA Corp.",
    AMD: "Advanced Micro Devices",
    NFLX: "Netflix Inc.",
    JPM: "JPMorgan Chase",
    BAC: "Bank of America",
    DIS: "Walt Disney Co.",
    PLTR: "Palantir Technologies",
    SNAP: "Snap Inc.",
    UBER: "Uber Technologies"
  };
  
  return companyNames[symbol] || symbol;
}
