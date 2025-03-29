import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate, formatPercent } from "../utils/formatters";
import { PortfolioStock } from "@shared/schema";
import AddStockDialog from "../components/AddStockDialog";

export default function Portfolio() {
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['/api/portfolio'],
  });

  const { data: quoteData } = useQuery({
    queryKey: ['/api/stocks/quotes/portfolio', portfolio],
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
      toast({
        title: "Stock removed",
        description: "The stock has been removed from your portfolio",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove stock from portfolio",
        variant: "destructive",
      });
    },
  });

  // Calculate portfolio totals
  const calculateTotals = () => {
    if (!portfolio || !quoteData) {
      return {
        totalValue: 0,
        totalCost: 0,
        totalGain: 0,
        totalGainPercent: 0,
        todayChange: 0,
        todayChangePercent: 0,
      };
    }

    let totalValue = 0;
    let totalCost = 0;
    let todayChange = 0;

    portfolio.forEach((stock: PortfolioStock) => {
      const quote = quoteData[stock.symbol];
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

    return {
      totalValue,
      totalCost,
      totalGain,
      totalGainPercent,
      todayChange,
      todayChangePercent,
    };
  };

  const totals = calculateTotals();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Portfolio</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-6 w-36 mb-2" />
                <Skeleton className="h-8 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Portfolio</h1>
        <Button onClick={() => setIsAddStockOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Stock
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-neutral-600 mb-1">Total Value</p>
            <p className="text-2xl font-bold">{formatCurrency(totals.totalValue)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-neutral-600 mb-1">Today's Change</p>
            <p className={`text-2xl font-bold ${totals.todayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totals.todayChange)} ({formatPercent(totals.todayChangePercent)})
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-neutral-600 mb-1">Total Gain/Loss</p>
            <p className={`text-2xl font-bold ${totals.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totals.totalGain)} ({formatPercent(totals.totalGainPercent)})
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          {portfolio.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-neutral-600 mb-4">You don't have any stocks in your portfolio yet.</p>
              <Button onClick={() => setIsAddStockOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Stock
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Shares</TableHead>
                  <TableHead className="text-right">Purchase Price</TableHead>
                  <TableHead className="text-right">Current Price</TableHead>
                  <TableHead className="text-right">Market Value</TableHead>
                  <TableHead className="text-right">Gain/Loss</TableHead>
                  <TableHead className="text-right">Today's Change</TableHead>
                  <TableHead className="text-right">Purchase Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolio.map((stock: PortfolioStock) => {
                  const quote = quoteData?.[stock.symbol];
                  const currentPrice = quote ? parseFloat(quote["05. price"]) : 0;
                  const priceChange = quote ? parseFloat(quote["09. change"]) : 0;
                  const priceChangePercent = quote ? parseFloat(quote["10. change percent"].replace('%', '')) : 0;
                  
                  const shares = Number(stock.shares);
                  const purchasePrice = Number(stock.purchasePrice);
                  const marketValue = currentPrice * shares;
                  const costBasis = purchasePrice * shares;
                  const gainLoss = marketValue - costBasis;
                  const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
                  const dayChange = priceChange * shares;
                  
                  return (
                    <TableRow key={stock.id}>
                      <TableCell className="font-medium">{stock.symbol}</TableCell>
                      <TableCell>{stock.name}</TableCell>
                      <TableCell className="text-right">{shares}</TableCell>
                      <TableCell className="text-right">{formatCurrency(purchasePrice)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(currentPrice)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(marketValue)}</TableCell>
                      <TableCell className={`text-right ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(gainLoss)} ({formatPercent(gainLossPercent)})
                      </TableCell>
                      <TableCell className={`text-right ${dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(dayChange)} ({formatPercent(priceChangePercent)})
                      </TableCell>
                      <TableCell className="text-right">{formatDate(stock.purchaseDate)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(stock.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-neutral-500" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <AddStockDialog 
        open={isAddStockOpen} 
        onOpenChange={setIsAddStockOpen} 
      />
    </div>
  );
}
