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

  if (error || !data || !data.feed || data.Information) {
    return (
      <Card className="card">
        <CardHeader>
          <CardTitle className="text-amber-300">Wizarding Market News</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            {data && data.Information ? (
              <div>
                {data.Information.includes("demo") ? (
                  <>
                    <h3 className="text-amber-200 text-lg mb-2">Demo API Key in Use</h3>
                    <p className="text-amber-300/60 text-sm italic mb-3">{data.Information}</p>
                    <p className="text-amber-300/70 mt-4">Get a free API key from <a href="https://www.alphavantage.co/support/#api-key" target="_blank" rel="noopener" className="underline text-amber-400 hover:text-amber-300">Alpha Vantage</a></p>
                  </>
                ) : data.Information.includes("detected") ? (
                  <>
                    <h3 className="text-amber-200 text-lg mb-2">API Rate Limit Reached</h3>
                    <p className="text-amber-300/60 text-sm italic mb-3">{data.Information}</p>
                    <p className="text-amber-300/70 mb-1">Alpha Vantage limits API requests to 5 calls per minute and 500 calls per day</p>
                    <p className="text-amber-300/70 mt-2">Try refreshing the page in a minute or two</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-amber-200 text-lg mb-2">API Error</h3>
                    <p className="text-amber-300/60 text-sm italic mb-3">{data.Information}</p>
                    <p className="text-amber-300/70 mb-1">Unable to load market news</p>
                  </>
                )}
              </div>
            ) : (
              <p className="text-amber-300/70">Could not load market news</p>
            )}
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
    <Card className="card">
      <CardHeader>
        <CardTitle className="text-amber-300">Wizarding Market News</CardTitle>
      </CardHeader>
      <CardContent>
        {newsItems.map((news: NewsItem, index: number) => (
          <div 
            key={index} 
            className={`pb-4 mb-4 ${index < newsItems.length - 1 ? 'border-b border-amber-900/30' : ''}`}
          >
            <div className="flex items-start">
              <div className="flex-grow">
                <h3 className="text-base font-medium mb-1">
                  <a 
                    href={news.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-200 hover:text-amber-300"
                  >
                    {news.title}
                  </a>
                </h3>
                <div className="flex text-xs text-amber-400/60 mb-2">
                  <span>{news.source}</span>
                  <span className="mx-1">•</span>
                  <span>{formatTimeAgo(news.time_published)}</span>
                </div>
                <p className="text-sm text-amber-300/70">
                  {news.summary.length > 150 
                    ? `${news.summary.substring(0, 150)}...` 
                    : news.summary}
                </p>
              </div>
              {news.banner_image && (
                <div className="ml-4 flex-shrink-0 h-16 w-16 rounded-md overflow-hidden bg-amber-900/20 border border-amber-800/30">
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
          <Button variant="link" className="text-sm text-amber-400 hover:text-amber-300 font-medium">
            View More Prophetic News
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MarketNewsLoading() {
  return (
    <Card className="card">
      <CardHeader>
        <CardTitle className="text-amber-300">Wizarding Market News</CardTitle>
      </CardHeader>
      <CardContent>
        {[...Array(3)].map((_, i) => (
          <div 
            key={i} 
            className={`pb-4 mb-4 ${i < 2 ? 'border-b border-amber-900/30' : ''}`}
          >
            <div className="flex items-start">
              <div className="flex-grow">
                <Skeleton className="h-5 w-full mb-2 bg-amber-800/30" />
                <div className="flex mb-2">
                  <Skeleton className="h-3 w-16 mr-2 bg-amber-800/30" />
                  <Skeleton className="h-3 w-24 bg-amber-800/30" />
                </div>
                <Skeleton className="h-4 w-full mb-1 bg-amber-800/30" />
                <Skeleton className="h-4 w-4/5 bg-amber-800/30" />
              </div>
              <div className="ml-4 flex-shrink-0">
                <Skeleton className="h-16 w-16 rounded-md bg-amber-800/30" />
              </div>
            </div>
          </div>
        ))}
        
        <div className="text-center mt-4">
          <Button variant="link" className="text-sm text-amber-400/50 font-medium" disabled>
            View More Prophetic News
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
