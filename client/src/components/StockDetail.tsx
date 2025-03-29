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
  
  if (!quote || quoteData?.Information) {
    return (
      <Card className="card mb-6">
        <CardContent className="p-5">
          <div className="text-center p-4">
            {quoteData && quoteData.Information ? (
              <div>
                {quoteData.Information.includes("demo") ? (
                  <>
                    <h3 className="text-amber-200 text-lg mb-2">Demo API Key in Use</h3>
                    <p className="text-amber-300/60 text-sm italic mb-3">{quoteData.Information}</p>
                    <p className="text-amber-300/70 mb-1">Unable to load stock data for <span className="font-semibold">{symbol}</span></p>
                    <p className="text-amber-300/70 mt-4">Get a free API key from <a href="https://www.alphavantage.co/support/#api-key" target="_blank" rel="noopener" className="underline text-amber-400 hover:text-amber-300">Alpha Vantage</a></p>
                  </>
                ) : quoteData.Information.includes("detected") ? (
                  <>
                    <h3 className="text-amber-200 text-lg mb-2">API Rate Limit Reached</h3>
                    <p className="text-amber-300/60 text-sm italic mb-3">{quoteData.Information}</p>
                    <p className="text-amber-300/70 mb-1">Alpha Vantage limits API requests to 5 calls per minute and 500 calls per day</p>
                    <p className="text-amber-300/70 mt-2">Try refreshing the page in a minute or two</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-amber-200 text-lg mb-2">API Error</h3>
                    <p className="text-amber-300/60 text-sm italic mb-3">{quoteData.Information}</p>
                    <p className="text-amber-300/70 mb-1">Unable to load stock data for <span className="font-semibold">{symbol}</span></p>
                  </>
                )}
              </div>
            ) : (
              <p className="text-amber-300/70">Could not load stock data for {symbol}</p>
            )}
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
    <Card className="card mb-6">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div className="flex items-center mb-2 sm:mb-0">
            <div className="mr-3">
              <div className="text-xl font-semibold text-amber-200">{symbol}</div>
              <div className="text-sm text-amber-300/70">
                {/* Alpha Vantage doesn't provide company name in quote data */}
                {/* In a real app, you'd fetch this from a company profile API */}
                {symbol} Wizarding Shares
              </div>
            </div>
            <div className="bg-amber-900/30 text-amber-200 text-xs py-1 px-2 rounded border border-amber-700/30">GRIN</div>
          </div>
          
          <div className="flex items-baseline">
            <span className="text-xl font-semibold mr-2 text-amber-100">{formatCurrency(price)}</span>
            <span className={isPositive ? "text-green-400 text-sm" : "text-red-400 text-sm"}>
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
                className={timeframe === tf 
                  ? "bg-amber-700 hover:bg-amber-800 text-amber-100 border-amber-600" 
                  : "bg-amber-900/20 hover:bg-amber-900/30 text-amber-300 border-amber-700/30"}
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>
        
        <StockChart symbol={symbol} timeframe={timeframe} />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div>
            <div className="text-xs text-amber-300/70 mb-1">Open</div>
            <div className="text-sm font-medium text-amber-200">{formatCurrency(open)}</div>
          </div>
          <div>
            <div className="text-xs text-amber-300/70 mb-1">High</div>
            <div className="text-sm font-medium text-amber-200">{formatCurrency(high)}</div>
          </div>
          <div>
            <div className="text-xs text-amber-300/70 mb-1">Low</div>
            <div className="text-sm font-medium text-amber-200">{formatCurrency(low)}</div>
          </div>
          <div>
            <div className="text-xs text-amber-300/70 mb-1">Volume</div>
            <div className="text-sm font-medium text-amber-200">{formatNumber(volume)}</div>
          </div>
          <div>
            <div className="text-xs text-amber-300/70 mb-1">52-Week High</div>
            <div className="text-sm font-medium text-amber-200">{yearHigh === high ? "N/A" : formatCurrency(yearHigh)}</div>
          </div>
          <div>
            <div className="text-xs text-amber-300/70 mb-1">52-Week Low</div>
            <div className="text-sm font-medium text-amber-200">{yearLow === low ? "N/A" : formatCurrency(yearLow)}</div>
          </div>
          <div>
            <div className="text-xs text-amber-300/70 mb-1">Market Cap</div>
            <div className="text-sm font-medium text-amber-200">{marketCap}</div>
          </div>
          <div>
            <div className="text-xs text-amber-300/70 mb-1">P/E Ratio</div>
            <div className="text-sm font-medium text-amber-200">{peRatio}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StockDetailLoading() {
  return (
    <Card className="card mb-6">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div className="flex items-center mb-2 sm:mb-0">
            <div className="mr-3">
              <Skeleton className="h-6 w-16 mb-1 bg-amber-800/30" />
              <Skeleton className="h-4 w-24 bg-amber-800/30" />
            </div>
            <Skeleton className="h-6 w-12 bg-amber-800/30" />
          </div>
          
          <div className="flex items-baseline">
            <Skeleton className="h-6 w-20 mr-2 bg-amber-800/30" />
            <Skeleton className="h-4 w-16 bg-amber-800/30" />
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex space-x-2 pb-2">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-10 bg-amber-800/30" />
            ))}
          </div>
        </div>
        
        <Skeleton className="h-[300px] w-full mb-4 bg-amber-800/30" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-16 mb-1 bg-amber-800/30" />
              <Skeleton className="h-5 w-20 bg-amber-800/30" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
