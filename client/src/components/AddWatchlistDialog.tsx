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
});

interface AddWatchlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddWatchlistDialog({ open, onOpenChange }: AddWatchlistDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symbol: "",
      name: "",
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

  // Add to watchlist mutation
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      return apiRequest('POST', '/api/watchlist', {
        ...values,
        userId: 1, // Using demo user id
      });
    },
    onSuccess: () => {
      toast({
        title: "Stock added",
        description: "The stock has been added to your watchlist",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      onOpenChange(false);
      form.reset();
      setSearchQuery("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add stock to watchlist",
        variant: "destructive",
      });
    },
  });

  const handleSelectStock = (symbol: string, name: string) => {
    form.setValue("symbol", symbol);
    form.setValue("name", name);
    
    // Submit immediately after selection
    form.handleSubmit((values) => {
      mutation.mutate(values);
    })();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Watchlist</DialogTitle>
          <DialogDescription>
            Search for a stock to add to your watchlist.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="symbol"
              render={() => (
                <FormItem>
                  <FormLabel>Search for a stock</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter stock symbol or company name"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
