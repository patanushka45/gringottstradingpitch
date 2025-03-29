import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Form schema
const formSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  name: z.string().min(1, "Company name is required"),
  shares: z.coerce.number().positive("Shares must be a positive number"),
  purchasePrice: z.coerce.number().positive("Purchase price must be a positive number"),
});

interface AddStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddStockDialog({ open, onOpenChange }: AddStockDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStock, setSelectedStock] = useState<{ symbol: string; name: string } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symbol: "",
      name: "",
      shares: 0,
      purchasePrice: 0,
    },
  });

  // Search for stock
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/stocks/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return { bestMatches: [] };
      return fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery)}`).then(res => res.json());
    },
    enabled: searchQuery.length >= 2,
  });

  // Add stock mutation
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      return apiRequest('POST', '/api/portfolio', {
        ...values,
        userId: 1, // Using demo user id
        purchaseDate: new Date(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Stock added",
        description: "The stock has been added to your portfolio",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add stock to portfolio",
        variant: "destructive",
      });
    },
  });

  const handleSelectStock = (symbol: string, name: string) => {
    setSelectedStock({ symbol, name });
    form.setValue("symbol", symbol);
    form.setValue("name", name);
    setSearchQuery(""); // Clear search after selection
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  const resetForm = () => {
    form.reset();
    setSelectedStock(null);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Stock to Portfolio</DialogTitle>
          <DialogDescription>
            Add a stock to your portfolio to track its performance.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!selectedStock ? (
              <div className="space-y-2">
                <FormLabel>Search for a stock</FormLabel>
                <Input
                  placeholder="Enter stock symbol or company name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                {isLoading && (
                  <div className="p-2 border rounded-md">
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                )}
                
                {!isLoading && searchResults?.bestMatches?.length > 0 && (
                  <div className="max-h-[200px] overflow-y-auto border rounded-md">
                    {searchResults.bestMatches.map((result: any) => (
                      <div
                        key={result["1. symbol"]}
                        className="p-2 hover:bg-neutral-100 cursor-pointer"
                        onClick={() => handleSelectStock(result["1. symbol"], result["2. name"])}
                      >
                        <div className="font-medium">{result["1. symbol"]}</div>
                        <div className="text-sm text-neutral-600">{result["2. name"]}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                {!isLoading && searchQuery && (!searchResults?.bestMatches || searchResults.bestMatches.length === 0) && (
                  <div className="p-2 text-sm text-neutral-600 border rounded-md">
                    No results found. Try another search term.
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{selectedStock.symbol}</div>
                    <div className="text-sm text-neutral-600">{selectedStock.name}</div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedStock(null)}
                  >
                    Change
                  </Button>
                </div>
                
                <FormField
                  control={form.control}
                  name="shares"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Shares</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0.01" 
                          step="0.01" 
                          placeholder="0" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Price (per share)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0.01" 
                          step="0.01" 
                          placeholder="0.00" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!selectedStock || mutation.isPending || !form.formState.isValid}
              >
                {mutation.isPending ? "Adding..." : "Add to Portfolio"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
