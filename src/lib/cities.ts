export interface CityInfo {
  name: string;
  lat: number;
  lon: number;
}

export const CITIES: CityInfo[] = [
  { name: "上海", lat: 31.23, lon: 121.47 },
  { name: "北京", lat: 39.90, lon: 116.40 },
  { name: "广州", lat: 23.13, lon: 113.26 },
  { name: "深圳", lat: 22.54, lon: 114.06 },
  { name: "杭州", lat: 30.27, lon: 120.15 },
  { name: "成都", lat: 30.57, lon: 104.07 },
  { name: "南京", lat: 32.06, lon: 118.80 },
  { name: "武汉", lat: 30.59, lon: 114.30 },
  { name: "重庆", lat: 29.56, lon: 106.55 },
  { name: "西安", lat: 34.26, lon: 108.94 },
  { name: "苏州", lat: 31.30, lon: 120.62 },
  { name: "天津", lat: 39.13, lon: 117.20 },
  { name: "长沙", lat: 28.23, lon: 112.94 },
  { name: "郑州", lat: 34.75, lon: 113.65 },
  { name: "青岛", lat: 36.07, lon: 120.38 },
  { name: "大连", lat: 38.91, lon: 121.60 },
  { name: "厦门", lat: 24.48, lon: 118.09 },
  { name: "合肥", lat: 31.82, lon: 117.23 },
  { name: "昆明", lat: 25.04, lon: 102.71 },
  { name: "哈尔滨", lat: 45.75, lon: 126.65 },
];

export function getCityByName(name: string): CityInfo | undefined {
  return CITIES.find((c) => c.name === name);
}
