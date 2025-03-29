import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import StockDetail from "../components/StockDetail";
import MarketNews from "../components/MarketNews";

export default function StockPage() {
  const { symbol } = useParams<{ symbol: string }>();
  
  if (!symbol) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          No stock symbol provided. Please select a stock.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Stock Details</h1>
      
      <StockDetail symbol={symbol} />
      <MarketNews />
    </div>
  );
}
