import { Sunset } from "lucide-react";
import { useWeather, getWeatherInfo } from "@/hooks/useWeather";

interface WeatherWidgetProps {
  city: string;
}

export default function WeatherWidget({ city }: WeatherWidgetProps) {
  const { data, loading } = useWeather(city);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-1 animate-pulse">
        <div className="h-4 w-16 rounded bg-muted" />
        <div className="h-3 w-12 rounded bg-muted" />
      </div>
    );
  }

  if (!data) return null;

  const info = getWeatherInfo(data.weatherCode);

  return (
    <div className="flex flex-col items-center gap-0.5 text-center">
      <div className="flex items-center gap-1">
        <span className="text-lg">{info.emoji}</span>
        <span className="text-sm font-bold text-foreground">{data.temperature}°</span>
      </div>
      <span className="text-[11px] font-semibold text-muted-foreground">{info.label}</span>
      <div className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
        <Sunset className="h-3 w-3" />
        <span>{data.sunset}</span>
      </div>
    </div>
  );
}
