import { useState, useEffect } from "react";
import { getCityByName } from "@/lib/cities";

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  sunset: string; // HH:mm
}

const WMO_LABELS: Record<number, { label: string; emoji: string }> = {
  0: { label: "晴", emoji: "☀️" },
  1: { label: "晴间多云", emoji: "🌤️" },
  2: { label: "多云", emoji: "⛅" },
  3: { label: "阴", emoji: "☁️" },
  45: { label: "雾", emoji: "🌫️" },
  48: { label: "雾凇", emoji: "🌫️" },
  51: { label: "小毛毛雨", emoji: "🌦️" },
  53: { label: "毛毛雨", emoji: "🌦️" },
  55: { label: "大毛毛雨", emoji: "🌧️" },
  61: { label: "小雨", emoji: "🌧️" },
  63: { label: "中雨", emoji: "🌧️" },
  65: { label: "大雨", emoji: "🌧️" },
  66: { label: "冻雨", emoji: "🌧️" },
  67: { label: "大冻雨", emoji: "🌧️" },
  71: { label: "小雪", emoji: "🌨️" },
  73: { label: "中雪", emoji: "🌨️" },
  75: { label: "大雪", emoji: "❄️" },
  77: { label: "雪粒", emoji: "❄️" },
  80: { label: "阵雨", emoji: "🌦️" },
  81: { label: "中阵雨", emoji: "🌧️" },
  82: { label: "大阵雨", emoji: "🌧️" },
  85: { label: "阵雪", emoji: "🌨️" },
  86: { label: "大阵雪", emoji: "❄️" },
  95: { label: "雷暴", emoji: "⛈️" },
  96: { label: "雷暴冰雹", emoji: "⛈️" },
  99: { label: "大雷暴冰雹", emoji: "⛈️" },
};

export function getWeatherInfo(code: number) {
  return WMO_LABELS[code] ?? { label: "未知", emoji: "🌡️" };
}

export function useWeather(city: string) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cityInfo = getCityByName(city);
    if (!cityInfo) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchWeather() {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${cityInfo!.lat}&longitude=${cityInfo!.lon}&current=temperature_2m,weather_code&daily=sunset&timezone=Asia%2FShanghai&forecast_days=1`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("fetch failed");
        const json = await res.json();

        if (cancelled) return;

        const sunsetRaw = json.daily?.sunset?.[0] ?? "";
        const sunsetTime = sunsetRaw ? sunsetRaw.split("T")[1]?.slice(0, 5) : "";

        setData({
          temperature: Math.round(json.current.temperature_2m),
          weatherCode: json.current.weather_code,
          sunset: sunsetTime,
        });
      } catch (e) {
        console.error("Weather fetch error:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchWeather();
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [city]);

  return { data, loading };
}
