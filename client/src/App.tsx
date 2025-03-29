import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import StockPage from "./pages/StockPage";
import NotFound from "@/pages/not-found";
import MarketHeader from "./components/MarketHeader";
import Footer from "./components/Footer";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketHeader />
      <div className="flex-grow">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/stock/:symbol" component={StockPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
