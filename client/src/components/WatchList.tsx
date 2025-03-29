import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { WatchlistStock } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatPercent } from "../utils/formatters";
import AddWatchlistDialog from "./AddWatchlistDialog";
import { Link } from "wouter";

export default function WatchList() {
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: watchlist, isLoading } = useQuery({
    queryKey: ['/api/watchlist'],
  });

  const { data: quoteData } = useQuery({
    queryKey: ['/api/stocks/quotes/watchlist', watchlist],
    queryFn: async () => {
      if (!watchlist || watchlist.length === 0) return {};
      
      const quotes: Record<string, any> = {};
      
      // Due to API rate limits, we need to fetch quotes one by one
      for (const stock of watchlist) {
        try {
          const response = await fetch(`/api/stocks/quote/${stock.symbol}`);
          const data = await response.json();
          quotes[stock.symbol] = data["Global Quote"] || null;
        } catch (error) {
          console.error(`Failed to fetch quote for ${stock.symbol}:`, error);
        }
      }
      
      return quotes;
    },
    enabled: !!watchlist && watchlist.length > 0,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/watchlist/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
    },
  });

  if (isLoading) {
    return <WatchListLoading />;
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Watchlist</CardTitle>
          <Button variant="link" size="sm">Edit</Button>
        </div>
      </CardHeader>
      <CardContent>
        {watchlist.map((stock: WatchlistStock) => {
          const quote = quoteData?.[stock.symbol];
          const currentPrice = quote ? parseFloat(quote["05. price"]) : 0;
          const priceChangePercent = quote ? parseFloat(quote["10. change percent"].replace('%', '')) : 0;
          
          return (
            <div key={stock.id} className="flex justify-between items-center mb-4 last:mb-0">
              <div>
                <div className="flex items-center">
                  <Link href={`/stock/${stock.symbol}`}>
                    <a className="text-sm font-semibold mr-2 hover:text-primary">{stock.symbol}</a>
                  </Link>
                  <span className="text-xs text-neutral-600">{stock.name}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{formatCurrency(currentPrice)}</div>
                <div className={`text-xs ${priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(priceChangePercent)}
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary p-0 h-auto"
            onClick={() => setIsAddStockOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add to Watchlist
          </Button>
        </div>
      </CardContent>
      
      <AddWatchlistDialog 
        open={isAddStockOpen} 
        onOpenChange={setIsAddStockOpen} 
      />
    </Card>
  );
}

function WatchListLoading() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Watchlist</CardTitle>
          <Button variant="link" size="sm">Edit</Button>
        </div>
      </CardHeader>
      <CardContent>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex justify-between items-center mb-4 last:mb-0">
            <div>
              <div className="flex items-center">
                <Skeleton className="h-4 w-12 mr-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="h-4 w-16 mb-1" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
        
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <Button variant="ghost" size="sm" className="text-primary p-0 h-auto" disabled>
            <Plus className="h-4 w-4 mr-1" />
            Add to Watchlist
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
