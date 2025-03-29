import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "../utils/formatters";
interface FantasyToken {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  owner: string;
  baseStock?: string;
  contractAddress?: string;
}

interface TokenFormData {
  name: string;
  symbol: string;
  basePrice: number;
  initialSupply: number;
  ownerAddress: string;
  baseStock: string;
}

export default function FantasyTeamTokens() {
  const queryClient = useQueryClient();
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  
  // Fetch fantasy tokens from the API
  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ['/api/fantasy-tokens'],
    queryFn: async () => {
      const response = await fetch('/api/fantasy-tokens');
      return response.json() as Promise<FantasyToken[]>;
    },
  });
  
  // Create a new fantasy token mutation
  const createTokenMutation = useMutation({
    mutationFn: async (tokenData: TokenFormData) => {
      const response = await fetch('/api/fantasy-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokenData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fantasy-tokens'] });
    },
  });
  
  // Function to simulate token trading
  const tradeToken = (id: string) => {
    // In a real implementation, this would interact with a blockchain/smart contract
    alert("In a complete implementation, this would connect to MetaMask or another Web3 wallet to execute a trade on the blockchain.");
  };
  
  // Function to create a new token via API
  const createToken = () => {
    setIsCreatingToken(true);
    
    // Example token to create - a real version would have a form for user input
    const newToken = {
      name: `Wizarding ${["Apple", "Microsoft", "Google", "Amazon", "Tesla"][Math.floor(Math.random() * 5)]}`,
      symbol: `WZ${["APL", "MSF", "GOO", "AMZ", "TSL"][Math.floor(Math.random() * 5)]}`,
      basePrice: 100 + Math.floor(Math.random() * 200),
      initialSupply: 1000 + Math.floor(Math.random() * 9000),
      ownerAddress: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
      baseStock: ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"][Math.floor(Math.random() * 5)]
    };
    
    createTokenMutation.mutate(newToken, {
      onSuccess: () => {
        alert("Fantasy Token created! In a complete implementation, this would deploy a new token smart contract to the blockchain.");
        setIsCreatingToken(false);
      },
      onError: () => {
        alert("Failed to create token. Please try again.");
        setIsCreatingToken(false);
      }
    });
  };
  
  // Loading skeleton
  if (isLoading) {
    return (
      <Card className="border-amber-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 pb-2">
          <CardTitle className="text-xl font-serif text-red-900">Fantasy Team Tokens</CardTitle>
          <CardDescription className="text-amber-800">Blockchain-powered fantasy tokens</CardDescription>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-2 border border-amber-100 rounded-md bg-white">
                <Skeleton className="h-6 w-40 mb-2 bg-amber-100" />
                <Skeleton className="h-4 w-32 bg-amber-50" />
              </div>
            ))}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between bg-gradient-to-r from-amber-50 to-amber-100 pt-2">
          <Skeleton className="h-9 w-36 bg-amber-100" />
          <Skeleton className="h-9 w-20 bg-amber-50" />
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="border-amber-200 shadow-md">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 pb-2">
        <CardTitle className="text-xl font-serif text-red-900">Fantasy Team Tokens</CardTitle>
        <CardDescription className="text-amber-800">Blockchain-powered fantasy tokens</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-4">
        {tokens && tokens.length > 0 ? (
          <div className="space-y-3">
            {tokens.map((token: FantasyToken) => (
              <div 
                key={token.id} 
                className="flex items-center justify-between p-2 border border-amber-100 rounded-md bg-white hover:bg-amber-50 cursor-pointer"
                onClick={() => tradeToken(token.id)}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-red-800">{token.name}</h3>
                    <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">{token.symbol}</Badge>
                  </div>
                  <div className="text-sm text-gray-600">Owner: {token.owner}</div>
                  {token.baseStock && (
                    <div className="text-xs text-amber-700">Based on: {token.baseStock}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(token.price)}</div>
                  <div className={token.change24h >= 0 ? "text-green-600 text-sm" : "text-red-600 text-sm"}>
                    {token.change24h >= 0 ? "+" : ""}{token.change24h}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-amber-800">
            No fantasy tokens available. Create your first token!
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between bg-gradient-to-r from-amber-50 to-amber-100 pt-2">
        <Button 
          variant="outline" 
          className="text-red-800 border-amber-300 hover:bg-amber-100"
          onClick={() => createToken()}
          disabled={isCreatingToken || createTokenMutation.isPending}
        >
          {isCreatingToken || createTokenMutation.isPending ? "Creating..." : "Create Fantasy Token"}
        </Button>
        <Button 
          variant="ghost"
          className="text-amber-800 hover:text-red-800 hover:bg-amber-100"
        >
          View All
        </Button>
      </CardFooter>
    </Card>
  );
}