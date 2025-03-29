import { useQuery } from "@tanstack/react-query";
import MarketSummary from "../components/MarketSummary";
import PortfolioSummary from "../components/PortfolioSummary";
import WatchList from "../components/WatchList";
import StockDetail from "../components/StockDetail";
import TopMovers from "../components/TopMovers";
import MarketNews from "../components/MarketNews";

export default function Dashboard() {
  // Get a default stock for the detail view
  // In a real app, this might be the most viewed stock
  // or the most significant market mover
  const { data: portfolio } = useQuery({
    queryKey: ['/api/portfolio'],
  });

  const defaultSymbol = portfolio && portfolio.length > 0 
    ? portfolio[0].symbol 
    : "AAPL"; // Fallback to a well-known stock

  return (
    <div className="container mx-auto px-4 py-6">
      <MarketSummary />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <PortfolioSummary />
          <WatchList />
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          <StockDetail symbol={defaultSymbol} />
          <TopMovers />
          <MarketNews />
        </div>
      </div>
    </div>
  );
}
