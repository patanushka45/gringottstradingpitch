import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StockChart from "./StockChart";
import { formatCurrency, formatPercent, formatNumber } from "../utils/formatters";

type TimeframeType = "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y" | "Max";

export default function StockDetail({ symbol }: { symbol: string }) {
  const [timeframe, setTimeframe] = useState<TimeframeType>("1D");

  const { data: quoteData, isLoading: isLoadingQuote } = useQuery({
    queryKey: [`/api/stocks/quote/${symbol}`],
  });

  if (isLoadingQuote) {
    return <StockDetailLoading />;
  }

  const quote = quoteData?.["Global Quote"];
  
  if (!quote) {
    return (
      <Card className="border border-neutral-200 mb-6">
        <CardContent className="p-5">
          <div className="text-center p-4">
            <p className="text-neutral-600">Could not load stock data for {symbol}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const price = parseFloat(quote["05. price"]);
  const change = parseFloat(quote["09. change"]);
  const changePercent = parseFloat(quote["10. change percent"].replace('%', ''));
  const isPositive = change >= 0;
  
  const open = parseFloat(quote["02. open"]);
  const high = parseFloat(quote["03. high"]);
  const low = parseFloat(quote["04. low"]);
  const volume = parseInt(quote["06. volume"]);

  // These fields are not provided by Alpha Vantage's Global Quote API
  // In a real app, you would fetch additional details from a company profile API
  const marketCap = "N/A";
  const peRatio = "N/A";
  const yearHigh = high;
  const yearLow = low;

  return (
    <Card className="border border-neutral-200 mb-6">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div className="flex items-center mb-2 sm:mb-0">
            <div className="mr-3">
              <div className="text-xl font-semibold">{symbol}</div>
              <div className="text-sm text-neutral-600">
                {/* Alpha Vantage doesn't provide company name in quote data */}
                {/* In a real app, you'd fetch this from a company profile API */}
                {symbol}
              </div>
            </div>
            <div className="bg-neutral-100 text-neutral-700 text-xs py-1 px-2 rounded">NYSE</div>
          </div>
          
          <div className="flex items-baseline">
            <span className="text-xl font-semibold mr-2">{formatCurrency(price)}</span>
            <span className={isPositive ? "text-green-600 text-sm" : "text-red-600 text-sm"}>
              {formatCurrency(change)} ({formatPercent(changePercent)})
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex overflow-x-auto scrollbar-hide space-x-2 pb-2">
            {(["1D", "1W", "1M", "3M", "1Y", "5Y", "Max"] as TimeframeType[]).map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(tf)}
                className={timeframe === tf ? "bg-primary text-white" : "bg-neutral-100 text-neutral-700"}
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>
        
        <StockChart symbol={symbol} timeframe={timeframe} />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div>
            <div className="text-xs text-neutral-600 mb-1">Open</div>
            <div className="text-sm font-medium">{formatCurrency(open)}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-600 mb-1">High</div>
            <div className="text-sm font-medium">{formatCurrency(high)}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-600 mb-1">Low</div>
            <div className="text-sm font-medium">{formatCurrency(low)}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-600 mb-1">Volume</div>
            <div className="text-sm font-medium">{formatNumber(volume)}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-600 mb-1">52-Week High</div>
            <div className="text-sm font-medium">{yearHigh === high ? "N/A" : formatCurrency(yearHigh)}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-600 mb-1">52-Week Low</div>
            <div className="text-sm font-medium">{yearLow === low ? "N/A" : formatCurrency(yearLow)}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-600 mb-1">Market Cap</div>
            <div className="text-sm font-medium">{marketCap}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-600 mb-1">P/E Ratio</div>
            <div className="text-sm font-medium">{peRatio}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StockDetailLoading() {
  return (
    <Card className="border border-neutral-200 mb-6">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div className="flex items-center mb-2 sm:mb-0">
            <div className="mr-3">
              <Skeleton className="h-6 w-16 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-6 w-12" />
          </div>
          
          <div className="flex items-baseline">
            <Skeleton className="h-6 w-20 mr-2" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex space-x-2 pb-2">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-10" />
            ))}
          </div>
        </div>
        
        <Skeleton className="h-[300px] w-full mb-4" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-16 mb-1" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
