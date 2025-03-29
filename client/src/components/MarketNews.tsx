import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

type NewsItem = {
  title: string;
  summary: string;
  url: string;
  banner_image?: string;
  source: string;
  source_domain: string;
  time_published: string;
  topics: {
    topic: string;
    relevance_score: string;
  }[];
};

export default function MarketNews() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/market/news'],
    queryFn: async () => {
      const response = await fetch('/api/market/news');
      return response.json();
    },
  });

  if (isLoading) {
    return <MarketNewsLoading />;
  }

  if (error || !data || !data.feed) {
    return (
      <Card className="border border-neutral-200">
        <CardHeader>
          <CardTitle>Market News</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <p className="text-neutral-600">Could not load market news</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const newsItems = data.feed.slice(0, 3);

  const formatTimeAgo = (timestamp: string) => {
    try {
      const publishTime = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - publishTime.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffMins > 0) {
        return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      } else {
        return 'Just now';
      }
    } catch (e) {
      return timestamp;
    }
  };

  return (
    <Card className="border border-neutral-200">
      <CardHeader>
        <CardTitle>Market News</CardTitle>
      </CardHeader>
      <CardContent>
        {newsItems.map((news: NewsItem, index: number) => (
          <div 
            key={index} 
            className={`pb-4 mb-4 ${index < newsItems.length - 1 ? 'border-b border-neutral-200' : ''}`}
          >
            <div className="flex items-start">
              <div className="flex-grow">
                <h3 className="text-base font-medium mb-1">
                  <a 
                    href={news.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary"
                  >
                    {news.title}
                  </a>
                </h3>
                <div className="flex text-xs text-neutral-600 mb-2">
                  <span>{news.source}</span>
                  <span className="mx-1">•</span>
                  <span>{formatTimeAgo(news.time_published)}</span>
                </div>
                <p className="text-sm text-neutral-700">
                  {news.summary.length > 150 
                    ? `${news.summary.substring(0, 150)}...` 
                    : news.summary}
                </p>
              </div>
              {news.banner_image && (
                <div className="ml-4 flex-shrink-0 h-16 w-16 rounded-md overflow-hidden bg-neutral-100">
                  <img 
                    src={news.banner_image} 
                    alt={news.title} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // Hide image on error
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        
        <div className="text-center mt-4">
          <Button variant="link" className="text-sm text-primary font-medium">
            View More News
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MarketNewsLoading() {
  return (
    <Card className="border border-neutral-200">
      <CardHeader>
        <CardTitle>Market News</CardTitle>
      </CardHeader>
      <CardContent>
        {[...Array(3)].map((_, i) => (
          <div 
            key={i} 
            className={`pb-4 mb-4 ${i < 2 ? 'border-b border-neutral-200' : ''}`}
          >
            <div className="flex items-start">
              <div className="flex-grow">
                <Skeleton className="h-5 w-full mb-2" />
                <div className="flex mb-2">
                  <Skeleton className="h-3 w-16 mr-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-4/5" />
              </div>
              <div className="ml-4 flex-shrink-0">
                <Skeleton className="h-16 w-16 rounded-md" />
              </div>
            </div>
          </div>
        ))}
        
        <div className="text-center mt-4">
          <Button variant="link" className="text-sm text-primary font-medium" disabled>
            View More News
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
