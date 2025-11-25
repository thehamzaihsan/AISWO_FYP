import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { ArrowLeft, RefreshCw, TrendingUp, Weight, Ruler } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { API_CONFIG } from './config';

import BinStatus from "./BinStatus";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function BinDashboard() {
  const [current, setCurrent] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    Promise.all([
      fetch(`${API_CONFIG.BACKEND_URL}/bins/${id}`)
        .then(res => res.json())
        .then(data => {
          console.log('Current bin data:', data);
          setCurrent(data);
        })
        .catch(err => console.error('Error fetching current data:', err)),
      fetch(`${API_CONFIG.BACKEND_URL}/bins/${id}/history`)
        .then(res => res.json())
        .then(data => {
          console.log('History data:', data);
          const historyArray = data ? Object.values(data) : [];
          setHistory(historyArray);
        })
        .catch(err => console.error('Error fetching history:', err))
    ]).finally(() => setLoading(false));
  }, [id]);

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    // Check if it's ISO format or millis
    if (timestamp.includes('T')) {
      // ISO format: "2025-11-23T14:12:21Z"
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      // Millis format - convert to relative time
      const mins = Math.floor(parseInt(timestamp) / 60000);
      return `${mins}m ago`;
    }
  };

  // Convert weight to percentage (out of 3kg max)
  const weightToPercentage = (weightKg) => {
    const maxWeight = 3; // 3kg max capacity
    return Math.min((weightKg / maxWeight) * 100, 100);
  };

  const chartData = {
    labels: history.slice(-20).map(h => formatTimestamp(h.timestamp || h.ts)),
    datasets: [
      {
        label: "Weight (%)",
        data: history.slice(-20).map(h => weightToPercentage(h.weightKg || 0)),
        borderColor: "#34C759",
        backgroundColor: "rgba(52, 199, 89, 0.1)",
        borderWidth: 3,
        pointBackgroundColor: "#34C759",
        pointBorderColor: "#FFFFFF",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.4,
      },
      {
        label: "Fill Level (%)",
        data: history.slice(-20).map(h => h.fillPct || 0),
        borderColor: "#52D765",
        backgroundColor: "rgba(82, 215, 101, 0.1)",
        borderWidth: 3,
        pointBackgroundColor: "#52D765",
        pointBorderColor: "#FFFFFF",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
            weight: '600'
          }
        }
      },
      title: {
        display: true,
        text: 'Historical Data Trends',
        font: {
          size: 18,
          weight: '600'
        },
        color: '#1D1D1F',
        padding: 20
      },
      tooltip: {
        backgroundColor: 'rgba(29, 29, 31, 0.9)',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#34C759',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        intersect: false,
        mode: 'index',
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2) + '%';
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(142, 142, 147, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#6E6E73',
          font: {
            size: 12
          }
        }
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(142, 142, 147, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#6E6E73',
          font: {
            size: 12
          },
          callback: function(value) {
            return value + '%';
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={48} />
          <div className="text-xl">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/dashboard">
          <Button variant="outline" className="mb-4 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to All Bins
          </Button>
        </Link>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
          Bin Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Detailed monitoring and analytics for {id?.toUpperCase()}
        </p>
      </div>


      {/* Current Status */}
      <BinStatus current={current} />

      {/* Chart Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Historical Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div className="h-96">
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No historical data available yet. Data will appear as the bin collects measurements.</p>
              <p className="text-sm mt-4">ESP32 sends data every 5 seconds.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent History</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--light-gray)" }}>
                    <th style={{ 
                      padding: "var(--space-md)", 
                      textAlign: "left", 
                      color: "var(--text-secondary)",
                      fontWeight: "600"
                    }}>
                      Timestamp
                    </th>
                    <th style={{ 
                      padding: "var(--space-md)", 
                      textAlign: "center", 
                      color: "var(--text-secondary)",
                    fontWeight: "600"
                  }}>
                    Weight (% of 3kg)
                  </th>
                  <th style={{ 
                    padding: "var(--space-md)", 
                    textAlign: "center", 
                    color: "var(--text-secondary)",
                    fontWeight: "600"
                  }}>
                    Fill Level (%)
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.slice(-10).reverse().map((h, i) => {
                  const weightPercent = weightToPercentage(h.weightKg || 0);
                  return (
                  <tr key={i} style={{ 
                    borderBottom: "1px solid var(--light-gray)",
                    transition: "background-color var(--transition-fast)"
                  }}>
                    <td style={{ 
                      padding: "var(--space-md)", 
                      color: "var(--text-primary)",
                      fontWeight: "500"
                    }}>
                      {formatTimestamp(h.timestamp || h.ts)}
                    </td>
                    <td style={{ 
                      padding: "var(--space-md)", 
                      textAlign: "center",
                      color: "var(--primary-green)",
                      fontWeight: "600"
                    }}>
                      {weightPercent.toFixed(2)}%
                    </td>
                    <td style={{ 
                      padding: "var(--space-md)", 
                      textAlign: "center",
                      color: h.fillPct > 80 ? "var(--warning-red)" : h.fillPct > 60 ? "var(--warning-orange)" : "var(--primary-green)",
                      fontWeight: "600"
                    }}>
                      {(h.fillPct || 0).toFixed(2)}%
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No historical data available for this bin.</p>
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
}

export default BinDashboard;
