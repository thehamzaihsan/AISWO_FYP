import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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

    // Simulate API call delay
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
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #34C759 0%, #52D765 50%, #D4F4DD 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-lg)'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '400px',
        padding: 'var(--space-2xl)',
        textAlign: 'center'
      }}>
        {/* Logo */}
        <div style={{
          fontSize: 'var(--font-size-4xl)',
          marginBottom: 'var(--space-lg)',
          animation: 'bounce 2s ease-in-out infinite'
        }}>
          ♻️
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'var(--font-size-2xl)',
          fontWeight: '700',
          margin: '0 0 var(--space-md) 0',
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Sign in to AISWO
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          margin: '0 0 var(--space-xl) 0',
          fontSize: 'var(--font-size-sm)'
        }}>
          Enter your credentials to access the smart bin management tools.
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                border: '2px solid var(--light-gray)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-base)',
                transition: 'border-color var(--transition-fast)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--light-gray)'}
            />
          </div>

          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                border: '2px solid var(--light-gray)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-base)',
                transition: 'border-color var(--transition-fast)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--light-gray)'}
            />
          </div>

          {error && (
            <div style={{
              color: 'var(--warning-red)',
              fontSize: 'var(--font-size-sm)',
              marginBottom: 'var(--space-lg)',
              padding: 'var(--space-sm)',
              background: 'rgba(255, 59, 48, 0.1)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(255, 59, 48, 0.2)'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: 'var(--space-md)',
              fontSize: 'var(--font-size-base)',
              fontWeight: '600',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-sm)' }}>
                <span className="spinning" style={{ fontSize: 'var(--font-size-sm)' }}>⏳</span>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div style={{
          marginTop: 'var(--space-xl)',
          padding: 'var(--space-md)',
          background: 'var(--light-gray)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-secondary)',
          display: 'grid',
          gap: 'var(--space-sm)'
        }}>
          <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
            Quick demo accounts
          </div>
          {Object.entries(DEMO_USERS).map(([demoEmail, details]) => (
            <button
              key={demoEmail}
              type="button"
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}
              onClick={() => {
                setEmail(demoEmail);
                setPassword(details.password);
              }}
            >
              <span>{details.role === 'admin' ? 'Admin' : 'Field Operator'} </span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{demoEmail}</span>
            </button>
          ))}
        </div>

        {/* Back to Home */}
        <div style={{ marginTop: 'var(--space-lg)' }}>
          <button
            onClick={() => navigate('/')}
            className="btn btn-secondary"
            style={{ fontSize: 'var(--font-size-sm)' }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
