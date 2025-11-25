// React imports
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, AlertTriangle, CheckCircle, RefreshCw, ArrowRight, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { API_CONFIG } from './config';

function BinsList() {
  const [bins, setBins] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch bins from backend
  const fetchBins = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    
    try {
      const res = await fetch(`${API_CONFIG.BACKEND_URL}/bins`);
      const data = await res.json();
      setBins(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching bins:", err);
      setLoading(false);
    } finally {
      if (showRefreshing) setRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchBins();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => fetchBins(), 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusInfo = (fillPct) => {
    if (fillPct > 80) return { 
      status: "Full", 
      variant: "destructive", 
      icon: <AlertTriangle className="w-4 h-4" /> 
    };
    if (fillPct > 60) return { 
      status: "Warning", 
      variant: "warning", 
      icon: <TrendingUp className="w-4 h-4" /> 
    };
    return { 
      status: "Normal", 
      variant: "success", 
      icon: <CheckCircle className="w-4 h-4" /> 
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: "var(--space-2xl)" }}>
        <div style={{ textAlign: "center" }}>
          <RefreshCw className="animate-spin mx-auto mb-4" size={48} />
          <div className="text-xl">Loading Smart Bins...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-4 mb-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            Smart Bin Monitoring
          </h1>
          <Button
            onClick={() => fetchBins(true)}
            disabled={refreshing}
            variant="outline"
            size="icon"
            className="rounded-full"
          >
            <RefreshCw className={refreshing ? "animate-spin" : ""} size={20} />
          </Button>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Real-time monitoring of waste collection bins with intelligent alerts and analytics
        </p>
        {refreshing && (
          <div className="mt-4 text-green-600 text-sm font-medium">
            Updating data...
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {Object.keys(bins).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Warning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {Object.values(bins).filter(bin => bin.fillPct > 60 && bin.fillPct <= 80).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Needs Emptying</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {Object.values(bins).filter(bin => bin.fillPct > 80).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(bins).map(([id, bin]) => {
          const statusInfo = getStatusInfo(bin.fillPct || 0);
          return (
            <Card key={id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-5 h-5 text-muted-foreground" />
                    <CardTitle className="text-xl">{id.toUpperCase()}</CardTitle>
                  </div>
                  <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                    {statusInfo.icon}
                    {statusInfo.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Bin Metrics */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Weight</span>
                    <span className="font-semibold">{bin?.weightKg || 0} kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fill Level</span>
                    <span className="font-semibold">{Math.round(bin?.fillPct || 0)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Assigned To</span>
                    <span className="font-semibold text-xs">
                      {bin?.assignedOperator ? bin.assignedOperator.name : 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-semibold text-xs">{formatDate(bin?.updatedAt)}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2 mb-4">
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full transition-all ${
                        bin?.fillPct > 80 ? 'bg-red-600' : 
                        bin?.fillPct > 60 ? 'bg-yellow-600' : 
                        'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(bin?.fillPct || 0, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <Link to={`/bin/${id}`}>
                  <Button className="w-full" variant="default">
                    View Details
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {Object.keys(bins).length === 0 && (
        <Card className="text-center p-12">
          <div className="flex flex-col items-center gap-4">
            <Trash2 size={64} className="text-muted-foreground" />
            <div>
              <h3 className="text-xl font-semibold mb-2">No bins available</h3>
              <p className="text-muted-foreground">Check your connection or try again later.</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default BinsList;
