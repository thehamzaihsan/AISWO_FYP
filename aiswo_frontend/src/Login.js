import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Button } from './components/ui/button';
import { Alert, AlertDescription } from './components/ui/alert';
import { Loader2, AlertTriangle, Recycle } from 'lucide-react';

const DEMO_USERS = {
  'admin@gmail.com': {
    password: '12345678',
    role: 'admin',
    name: 'System Admin',
  },
  'operator1@aiswo.com': {
    password: '12345678',
    role: 'operator',
    name: 'John Smith',
    operatorId: 'op1',
    assignedBins: ['bin2'],
  },
  'operator2@aiswo.com': {
    password: '12345678',
    role: 'operator',
    name: 'Sarah Johnson',
    operatorId: 'op2',
    assignedBins: ['bin3'],
  },
};

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 500));

    const normalizedEmail = email.trim().toLowerCase();
    const demoUser = DEMO_USERS[normalizedEmail];

    if (!demoUser || demoUser.password !== password) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
      return;
    }

    let enrichedUser = {
      email: normalizedEmail,
      name: demoUser.name,
      role: demoUser.role,
      operatorId: demoUser.operatorId,
      assignedBins: demoUser.assignedBins || [],
    };

    if (demoUser.operatorId) {
      try {
        const operatorResponse = await fetch(
          `http://localhost:5000/operators/${demoUser.operatorId}`
        );
        if (operatorResponse.ok) {
          const operatorData = await operatorResponse.json();
          enrichedUser = {
            ...enrichedUser,
            name: operatorData.name || demoUser.name,
            assignedBins: operatorData.assignedBins || demoUser.assignedBins || [],
            phone: operatorData.phone,
          };
        }
      } catch (fetchError) {
        console.warn('Unable to fetch operator profile, using defaults.', fetchError);
      }
    }

    onLogin(enrichedUser);
    const destination = enrichedUser.role === 'admin' ? '/admin' : '/my-bins';
    const from = location.state?.from?.pathname || destination;
    navigate(from, { replace: true });

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Recycle className="mx-auto h-12 w-12 text-green-600" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Or{' '}
            <Link to="/" className="font-medium text-primary hover:underline">
              return to the homepage
            </Link>
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="#"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </CardFooter>
          </form>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Demo Accounts</CardTitle>
            <CardDescription>Click to populate credentials.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(DEMO_USERS).map(([demoEmail, details]) => (
              <Button
                key={demoEmail}
                variant="outline"
                className="w-full justify-between"
                onClick={() => {
                  setEmail(demoEmail);
                  setPassword(details.password);
                }}
              >
                <span>{details.role === 'admin' ? 'Admin' : 'Field Operator'}</span>
                <span className="text-muted-foreground">{demoEmail}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Login;
