/**
 * Weather Types (for NWS API integration)
 */

export interface WeatherConditions {
  locationId: string;
  locationName: string;
  timestamp: string;
  temperature: {
    value: number;
    unit: 'fahrenheit' | 'celsius';
  };
  humidity: number;
  windSpeed: {
    value: number;
    unit: 'mph' | 'kph';
  };
  windDirection: string;
  conditions: string; // e.g., "Partly Cloudy", "Clear", "Rain"
  icon: WeatherIcon;
  precipitation?: {
    probability: number;
    amount?: number;
  };
}

export type WeatherIcon =
  | 'clear-day'
  | 'clear-night'
  | 'partly-cloudy-day'
  | 'partly-cloudy-night'
  | 'cloudy'
  | 'rain'
  | 'snow'
  | 'thunderstorm'
  | 'fog'
  | 'wind';

export interface WeatherForecast {
  locationId: string;
  periods: WeatherForecastPeriod[];
  generatedAt: string;
}

export interface WeatherForecastPeriod {
  name: string; // e.g., "Tonight", "Thursday"
  startTime: string;
  endTime: string;
  temperature: number;
  temperatureUnit: 'F' | 'C';
  temperatureTrend?: 'rising' | 'falling';
  windSpeed: string;
  windDirection: string;
  shortForecast: string;
  detailedForecast: string;
  icon: WeatherIcon;
  isDaytime: boolean;
}

// NWS API response types (subset)
export interface NWSPointsResponse {
  properties: {
    gridId: string;
    gridX: number;
    gridY: number;
    forecast: string;
    forecastHourly: string;
    observationStations: string;
  };
}

export interface NWSForecastResponse {
  properties: {
    updateTime: string;
    periods: {
      number: number;
      name: string;
      startTime: string;
      endTime: string;
      isDaytime: boolean;
      temperature: number;
      temperatureUnit: string;
      temperatureTrend: string | null;
      windSpeed: string;
      windDirection: string;
      icon: string;
      shortForecast: string;
      detailedForecast: string;
    }[];
  };
}

export interface NWSObservationResponse {
  properties: {
    timestamp: string;
    textDescription: string;
    temperature: { value: number; unitCode: string };
    relativeHumidity: { value: number };
    windSpeed: { value: number; unitCode: string };
    windDirection: { value: number };
  };
}
