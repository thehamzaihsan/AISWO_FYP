import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Trash2, 
  BarChart3, 
  Cloud, 
  Bell, 
  MessageSquare, 
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";

function LandingPage() {
  const features = [
    {
      icon: <BarChart3 className="w-12 h-12" />,
      title: 'Real-time Monitoring',
      description: 'Live tracking of bin fill levels and weight with instant alerts',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: <Cloud className="w-12 h-12" />,
      title: 'Weather Integration',
      description: 'Smart alerts based on weather conditions and forecasts',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: <MessageSquare className="w-12 h-12" />,
      title: 'AI Assistant',
      description: 'Environmental chatbot for guidance and waste management tips',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const benefits = [
    { icon: <TrendingUp className="w-5 h-5" />, text: 'Reduce overflow by 80%' },
    { icon: <Shield className="w-5 h-5" />, text: 'Real-time alerts' },
    { icon: <Zap className="w-5 h-5" />, text: 'Optimize routes' },
    { icon: <CheckCircle2 className="w-5 h-5" />, text: 'Save costs' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-4" variant="secondary">
          Powered by IoT & AI
        </Badge>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
          Smart Bin Monitoring
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Revolutionizing waste management with intelligent monitoring, real-time alerts, and AI-powered insights
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Link to="/dashboard">
            <Button size="lg" className="gap-2">
              <BarChart3 className="w-5 h-5" />
              View Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/admin">
            <Button size="lg" variant="outline" className="gap-2">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-none shadow-sm">
              <CardContent className="pt-6 flex flex-col items-center gap-2">
                <div className="text-green-600">{benefit.icon}</div>
                <p className="text-sm font-medium text-center">{benefit.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage waste collection efficiently
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`${feature.bgColor} ${feature.color} w-20 h-20 rounded-lg flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">Simple, efficient, and automated</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Sensors Detect</h3>
              <p className="text-sm text-muted-foreground">
                IoT sensors monitor fill levels and weight in real-time
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">System Analyzes</h3>
              <p className="text-sm text-muted-foreground">
                AI processes data and sends alerts when action is needed
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Teams Respond</h3>
              <p className="text-sm text-muted-foreground">
                Operators receive notifications and take timely action
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-green-600 to-emerald-500 text-white border-none">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-green-50 mb-8 max-w-2xl mx-auto">
              Join the future of waste management. Monitor your bins in real-time and optimize collection routes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/dashboard">
                <Button size="lg" variant="secondary" className="gap-2">
                  <BarChart3 className="w-5 h-5" />
                  View Dashboard
                </Button>
              </Link>
              <Link to="/admin">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-green-600">
                  Admin Panel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default LandingPage;
