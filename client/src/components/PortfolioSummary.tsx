import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PortfolioStock } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatPercent } from "../utils/formatters";
import AddStockDialog from "./AddStockDialog";

export default function PortfolioSummary() {
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['/api/portfolio'],
  });

  const { data: quoteData } = useQuery({
    queryKey: ['/api/stocks/quotes', portfolio],
    queryFn: async () => {
      if (!portfolio || portfolio.length === 0) return {};
      
      const quotes: Record<string, any> = {};
      
      // Due to API rate limits, we need to fetch quotes one by one
      for (const stock of portfolio) {
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
    enabled: !!portfolio && portfolio.length > 0,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/portfolio/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
    },
  });

  if (isLoading) {
    return <PortfolioSummaryLoading />;
  }

  // Calculate total portfolio value and performance
  let totalValue = 0;
  let totalCost = 0;
  let todayChange = 0;

  portfolio.forEach((stock: PortfolioStock) => {
    const quote = quoteData?.[stock.symbol];
    const currentPrice = quote ? parseFloat(quote["05. price"]) : 0;
    const priceChange = quote ? parseFloat(quote["09. change"]) : 0;
    
    const stockValue = currentPrice * Number(stock.shares);
    const stockCost = Number(stock.purchasePrice) * Number(stock.shares);
    const stockDayChange = priceChange * Number(stock.shares);
    
    totalValue += stockValue;
    totalCost += stockCost;
    todayChange += stockDayChange;
  });

  const totalGain = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
  const todayChangePercent = totalValue > 0 ? (todayChange / totalValue) * 100 : 0;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Your Portfolio</CardTitle>
          <Button variant="link" size="sm">View All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline mb-5">
          <span className="text-2xl font-bold">{formatCurrency(totalValue)}</span>
          <span className={`ml-2 text-sm ${todayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(todayChange)} ({formatPercent(todayChangePercent)})
          </span>
        </div>
        
        <div className="flex justify-between text-sm text-neutral-600 mb-1">
          <span>Today's Gain/Loss</span>
          <span className={`font-medium ${todayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(todayChange)}
          </span>
        </div>
        
        <div className="flex justify-between text-sm text-neutral-600 mb-4">
          <span>Total Gain/Loss</span>
          <span className={`font-medium ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalGain)} ({formatPercent(totalGainPercent)})
          </span>
        </div>
        
        <Separator className="my-4" />
        
        <h3 className="text-sm font-medium mb-3">Holdings</h3>
        
        {portfolio.map((stock: PortfolioStock) => {
          const quote = quoteData?.[stock.symbol];
          const currentPrice = quote ? parseFloat(quote["05. price"]) : 0;
          const priceChangePercent = quote ? parseFloat(quote["10. change percent"].replace('%', '')) : 0;
          const stockValue = currentPrice * Number(stock.shares);
          
          return (
            <div key={stock.id} className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-neutral-100 rounded-md flex items-center justify-center text-neutral-700 mr-3">
                  <span className="text-xs font-semibold">{stock.symbol}</span>
                </div>
                <div>
                  <div className="text-sm font-medium">{stock.name}</div>
                  <div className="text-xs text-neutral-600">{stock.shares} shares</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{formatCurrency(stockValue)}</div>
                <div className={`text-xs ${priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(priceChangePercent)}
                </div>
              </div>
            </div>
          );
        })}
        
        <Button 
          variant="outline" 
          className="w-full mt-4 border-primary text-primary hover:bg-primary hover:text-white"
          onClick={() => setIsAddStockOpen(true)}
        >
          Add New Stock
        </Button>
      </CardContent>
      
      <AddStockDialog 
        open={isAddStockOpen} 
        onOpenChange={setIsAddStockOpen} 
      />
    </Card>
  );
}

function PortfolioSummaryLoading() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Your Portfolio</CardTitle>
          <Button variant="link" size="sm">View All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-40 mb-5" />
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <Skeleton className="h-5 w-24 mb-3" />
        
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <Skeleton className="w-8 h-8 rounded-md mr-3" />
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
        
        <Button variant="outline" className="w-full mt-4" disabled>
          Add New Stock
        </Button>
      </CardContent>
    </Card>
  );
}
