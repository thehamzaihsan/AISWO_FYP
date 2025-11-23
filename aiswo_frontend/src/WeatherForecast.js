import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_CONFIG } from './config';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { Button } from './components/ui/button';
import { Thermometer, Droplets, Wind, Gauge, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, Tornado, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

function WeatherForecast() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = API_CONFIG.OPENWEATHER_API_KEY;
  const BASE_URL = 'https://api.openweathermap.org/data/2.5';

  const fetchWeatherData = useCallback(async (lat, lon) => {
    try {
      setLoading(true);
      setError(null);

      const currentResponse = await axios.get(
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );

      const forecastResponse = await axios.get(
        `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );

      setWeather(currentResponse.data);
      setForecast(forecastResponse.data);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to fetch weather data. Please check your API key.');
    } finally {
      setLoading(false);
    }
  }, [API_KEY, BASE_URL]);

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherData(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          fetchWeatherData(40.7128, -74.0060); // New York as fallback
        }
      );
    } else {
      console.error('Geolocation not supported');
      fetchWeatherData(40.7128, -74.0060); // New York as fallback
    }
  }, [fetchWeatherData]);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const getWeatherIcon = (weatherId) => {
    if (weatherId >= 200 && weatherId < 300) return <CloudLightning className="w-10 h-10 text-purple-400" />;
    if (weatherId >= 300 && weatherId < 400) return <CloudDrizzle className="w-10 h-10 text-blue-400" />;
    if (weatherId >= 500 && weatherId < 600) return <CloudRain className="w-10 h-10 text-blue-600" />;
    if (weatherId >= 600 && weatherId < 700) return <CloudSnow className="w-10 h-10 text-gray-400" />;
    if (weatherId >= 700 && weatherId < 800) return <Tornado className="w-10 h-10 text-gray-500" />;
    if (weatherId === 800) return <Sun className="w-10 h-10 text-yellow-500" />;
    if (weatherId > 800) return <Cloud className="w-10 h-10 text-gray-400" />;
    return <Cloud className="w-10 h-10 text-gray-400" />;
  };

  const getBinAlertLevel = (weatherData) => {
    const { main, weather } = weatherData;
    const temp = main.temp;
    const humidity = main.humidity;
    const weatherId = weather[0].id;

    if (weatherId >= 500 && weatherId < 600) {
      return { level: 'destructive', message: 'Heavy rain expected! Bins may overflow. Check bin levels immediately.' };
    }
    if (humidity > 80 && temp > 25) {
      return { level: 'warning', message: 'High humidity and temperature. Monitor bins for odor and overflow.' };
    }
    if (temp < 0 || temp > 35) {
      return { level: 'warning', message: 'Extreme temperature conditions. Check bin functionality.' };
    }
    return { level: 'default', message: 'Weather conditions are normal for bin operations.' };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <RefreshCw className="animate-spin mx-auto mb-4 h-12 w-12 text-green-600" />
        <p className="text-lg text-muted-foreground">Loading weather data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Weather Data Unavailable</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => getCurrentLocation()}>Try Again</Button>
      </div>
    );
  }

  const binAlert = getBinAlertLevel(weather);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
          Weather Forecast
        </h1>
        <p className="text-lg text-muted-foreground">
          Smart weather monitoring for optimal bin management
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>5-Day Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead className="text-center">Condition</TableHead>
                    <TableHead className="text-right">Temp (°C)</TableHead>
                    <TableHead className="text-right">Humidity (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forecast.list.filter((item, index) => index % 8 === 0).slice(0, 5).map((day, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="font-medium">{new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' })}</div>
                        <div className="text-sm text-muted-foreground">{new Date(day.dt * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      </TableCell>
                      <TableCell className="text-center">{getWeatherIcon(day.weather[0].id)}</TableCell>
                      <TableCell className="text-right">{Math.round(day.main.temp)}°C</TableCell>
                      <TableCell className="text-right">{day.main.humidity}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Current Conditions</CardTitle>
              <p className="text-sm text-muted-foreground">{weather.name}, {weather.sys.country}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-5xl font-bold">{Math.round(weather.main.temp)}°C</div>
                  <div className="text-muted-foreground">{weather.weather[0].description}</div>
                </div>
                {getWeatherIcon(weather.weather[0].id)}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-muted-foreground" />
                  <span>Humidity: {weather.main.humidity}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-muted-foreground" />
                  <span>Wind: {weather.wind.speed} m/s</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-muted-foreground" />
                  <span>Pressure: {weather.main.pressure} hPa</span>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-muted-foreground" />
                  <span>Feels like: {Math.round(weather.main.feels_like)}°C</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Alert variant={binAlert.level}>
            {binAlert.level === 'default' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <AlertTitle>Bin Management Alert</AlertTitle>
            <AlertDescription>{binAlert.message}</AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}

export default WeatherForecast;
