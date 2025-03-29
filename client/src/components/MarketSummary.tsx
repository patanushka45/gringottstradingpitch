import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { CardContent, Card } from "@/components/ui/card";
import { MarketIndex } from "@shared/schema";
import { formatValue, formatPercent } from "../utils/formatters";

export default function MarketSummary() {
  const { data: indices, isLoading, error } = useQuery({
    queryKey: ['/api/market/indices'],
  });

  if (isLoading) {
    return <MarketSummaryLoading />;
  }

  if (error) {
    return (
      <div className="mb-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Failed to load market summary. Please try again later.
        </div>
      </div>
    );
  }

  const lastUpdated = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Market Summary</h2>
        <div className="text-sm text-neutral-600 mt-2 sm:mt-0">
          Last updated: {lastUpdated}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {indices.map((index: MarketIndex) => (
          <IndexCard key={index.id} index={index} />
        ))}
      </div>
    </div>
  );
}

function IndexCard({ index }: { index: MarketIndex }) {
  const isPositive = index.change >= 0;
  
  return (
    <Card className="border border-neutral-200">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-neutral-600 mb-1">{index.name}</h3>
        <div className="flex items-baseline">
          <span className="text-lg font-semibold">{formatValue(index.value)}</span>
          <span className={`ml-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercent(index.changePercent)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function MarketSummaryLoading() {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Market Summary</h2>
        <div className="text-sm text-neutral-600 mt-2 sm:mt-0">
          <Skeleton className="h-4 w-44" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border border-neutral-200">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-6 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
