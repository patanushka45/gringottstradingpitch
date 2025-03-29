import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

type TimeframeType = "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y" | "Max";

interface StockChartProps {
  symbol: string;
  timeframe: TimeframeType;
}

export default function StockChart({ symbol, timeframe }: StockChartProps) {
  // Map timeframe to API endpoint and interval
  const getEndpointAndInterval = (tf: TimeframeType) => {
    switch (tf) {
      case "1D":
        return { endpoint: "intraday", interval: "5min" };
      case "1W":
        return { endpoint: "intraday", interval: "60min" };
      case "1M":
        return { endpoint: "daily", interval: "" };
      case "3M":
        return { endpoint: "daily", interval: "" };
      case "1Y":
        return { endpoint: "weekly", interval: "" };
      case "5Y":
        return { endpoint: "weekly", interval: "" };
      case "Max":
        return { endpoint: "monthly", interval: "" };
      default:
        return { endpoint: "intraday", interval: "5min" };
    }
  };

  const { endpoint, interval } = getEndpointAndInterval(timeframe);

  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/stocks/${endpoint}/${symbol}`, interval],
    queryFn: async () => {
      const url = `/api/stocks/${endpoint}/${symbol}${interval ? `?interval=${interval}` : ''}`;
      const response = await fetch(url);
      return response.json();
    },
  });

  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      let timeSeriesKey: string = "";
      
      // Find the time series key in the response
      if (endpoint === "intraday") {
        timeSeriesKey = `Time Series (${interval})`;
      } else if (endpoint === "daily") {
        timeSeriesKey = "Time Series (Daily)";
      } else if (endpoint === "weekly") {
        timeSeriesKey = "Weekly Time Series";
      } else if (endpoint === "monthly") {
        timeSeriesKey = "Monthly Time Series";
      }
      
      const timeSeries = data[timeSeriesKey];
      
      if (timeSeries) {
        // Convert the time series object to an array for Recharts
        let chartPoints = Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
          date,
          value: parseFloat(values["4. close"]),
          open: parseFloat(values["1. open"]),
          high: parseFloat(values["2. high"]),
          low: parseFloat(values["3. low"]),
          volume: parseFloat(values["5. volume"]),
        }));
        
        // Filter based on timeframe
        if (timeframe === "1D") {
          const today = new Date().toISOString().split('T')[0];
          chartPoints = chartPoints.filter(point => point.date.startsWith(today));
        } else if (timeframe === "1W") {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          chartPoints = chartPoints.filter(point => new Date(point.date) >= oneWeekAgo);
        } else if (timeframe === "1M") {
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          chartPoints = chartPoints.filter(point => new Date(point.date) >= oneMonthAgo);
        } else if (timeframe === "3M") {
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          chartPoints = chartPoints.filter(point => new Date(point.date) >= threeMonthsAgo);
        } else if (timeframe === "1Y") {
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
          chartPoints = chartPoints.filter(point => new Date(point.date) >= oneYearAgo);
        } else if (timeframe === "5Y") {
          const fiveYearsAgo = new Date();
          fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
          chartPoints = chartPoints.filter(point => new Date(point.date) >= fiveYearsAgo);
        }
        
        // Sort by date (ascending)
        chartPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setChartData(chartPoints);
      }
    }
  }, [data, endpoint, interval, timeframe]);

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (error || !chartData.length) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center bg-neutral-50 border border-neutral-200 rounded-md">
        <p className="text-neutral-600">
          {error ? "Error loading chart data" : "No data available for the selected timeframe"}
        </p>
      </div>
    );
  }

  // Format the date for the X-axis
  const formatXAxis = (date: string) => {
    if (timeframe === "1D") {
      // For intraday, show time only
      return date.split(" ")[1]?.substring(0, 5) || date;
    } else if (timeframe === "1W" || timeframe === "1M") {
      // For weekly and monthly, show day and month
      const d = new Date(date);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    } else {
      // For yearly and max, show month and year
      const d = new Date(date);
      return `${d.getMonth() + 1}/${d.getFullYear().toString().substr(2, 2)}`;
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-neutral-200 rounded shadow-sm text-xs">
          <p className="font-medium">{label}</p>
          <p className="text-primary">Price: ${payload[0].value.toFixed(2)}</p>
          {payload[0].payload.open && (
            <>
              <p>Open: ${payload[0].payload.open.toFixed(2)}</p>
              <p>High: ${payload[0].payload.high.toFixed(2)}</p>
              <p>Low: ${payload[0].payload.low.toFixed(2)}</p>
              <p>Volume: {payload[0].payload.volume.toLocaleString()}</p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  // Calculate value domain for Y-axis with padding
  const minValue = Math.min(...chartData.map(item => item.value));
  const maxValue = Math.max(...chartData.map(item => item.value));
  const padding = (maxValue - minValue) * 0.1;
  const yDomain = [minValue - padding, maxValue + padding];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0F4C81" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#0F4C81" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#DEE2E6" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            tick={{ fontSize: 10 }}
            minTickGap={20}
            axisLine={{ stroke: "#DEE2E6" }}
            tickLine={{ stroke: "#DEE2E6" }}
          />
          <YAxis
            domain={yDomain}
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
            axisLine={{ stroke: "#DEE2E6" }}
            tickLine={{ stroke: "#DEE2E6" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#0F4C81"
            fillOpacity={1}
            fill="url(#colorValue)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
