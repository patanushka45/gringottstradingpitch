import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Bell, Search, Plus, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type SearchResult = {
  symbol: string;
  name: string;
  type: string;
  region: string;
  marketOpen: string;
  marketClose: string;
  timezone: string;
  currency: string;
  matchScore: string;
};

export default function MarketHeader() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['/api/stocks/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return { bestMatches: [] };
      return fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery)}`).then(res => res.json());
    },
    enabled: searchQuery.length >= 2
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults?.bestMatches?.[0]) {
      setLocation(`/stock/${searchResults.bestMatches[0].symbol}`);
      setSearchQuery("");
      setShowResults(false);
    }
  };

  return (
    <header className="bg-[#1a0505] border-b border-amber-900/50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center space-x-2">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <h1 className="text-xl font-semibold text-amber-400" style={{textShadow: '0 0 5px rgba(255, 175, 0, 0.5)'}}>Gringotts Market Vault</h1>
            </a>
          </Link>

          <div className="hidden md:block relative w-64">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-amber-600" />
              <Input
                type="text"
                placeholder="Search magical stocks..."
                className="w-full py-2 pl-8 pr-4 bg-amber-900/20 border-amber-800/50 text-amber-100 placeholder:text-amber-300/50"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => searchQuery && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
              />
              {showResults && searchQuery.length >= 2 && (
                <div className="absolute z-10 w-full mt-1 bg-[#1a0505] border border-amber-900/50 rounded-md shadow-lg">
                  {isLoading && (
                    <div className="p-2">
                      <Skeleton className="h-6 w-full mb-2 bg-amber-900/20" />
                      <Skeleton className="h-6 w-full mb-2 bg-amber-900/20" />
                      <Skeleton className="h-6 w-full bg-amber-900/20" />
                    </div>
                  )}
                  {!isLoading && error && (
                    <div className="p-2 text-sm text-red-400">Error searching stocks</div>
                  )}
                  {!isLoading && !error && searchResults?.bestMatches?.length === 0 && (
                    <div className="p-2 text-sm text-amber-300/70">No magical results found</div>
                  )}
                  {!isLoading && !error && searchResults?.bestMatches?.length > 0 && (
                    <ul>
                      {searchResults.bestMatches.slice(0, 5).map((result: SearchResult) => (
                        <li key={result.symbol}>
                          <Link href={`/stock/${result.symbol}`}>
                            <a className="block p-2 hover:bg-amber-900/30 text-sm">
                              <div className="font-medium text-amber-200">{result.symbol}</div>
                              <div className="text-xs text-amber-300/70">{result.name}</div>
                            </a>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </form>
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/portfolio">
              <Button variant="default" size="sm" className="hidden md:flex bg-amber-700 hover:bg-amber-800 text-amber-100">
                <Plus className="mr-1 h-4 w-4" />
                Add Investment
              </Button>
            </Link>

            <Button variant="ghost" size="icon" className="rounded-full text-amber-400 hover:text-amber-300 hover:bg-amber-900/30">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full h-8 w-8 p-0">
                  <div className="h-8 w-8 rounded-full bg-amber-700 text-amber-100 flex items-center justify-center border border-amber-500/50">
                    <User className="h-4 w-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1a0505] border-amber-900/50 text-amber-100">
                <DropdownMenuItem className="hover:bg-amber-900/30 focus:bg-amber-900/30">
                  <Link href="/portfolio">
                    <a className="w-full">My Vault</a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-amber-900/30 focus:bg-amber-900/30">Settings</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-amber-900/30 focus:bg-amber-900/30">Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
