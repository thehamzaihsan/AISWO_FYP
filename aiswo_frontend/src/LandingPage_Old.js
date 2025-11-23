import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M9 9h6v6H9z" fill="currentColor" opacity="0.3"/>
          <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="18" cy="6" r="2" fill="#34C759"/>
        </svg>
      ),
      title: 'Real-time Monitoring',
      description: 'Live tracking of bin fill levels and weight with instant alerts',
      color: '#34C759',
      bgColor: 'rgba(52, 199, 89, 0.1)'
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
          <path d="M19 15L20.09 18.26L23 19L20.09 19.74L19 23L17.91 19.74L15 19L17.91 18.26L19 15Z" fill="currentColor" opacity="0.6"/>
          <path d="M5 10L6.09 13.26L9 14L6.09 14.74L5 18L3.91 14.74L1 14L3.91 13.26L5 10Z" fill="currentColor" opacity="0.4"/>
        </svg>
      ),
      title: 'Weather Integration',
      description: 'Smart alerts based on weather conditions and forecasts',
      color: '#007AFF',
      bgColor: 'rgba(0, 122, 255, 0.1)'
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="8" cy="10" r="1" fill="currentColor"/>
          <circle cx="12" cy="10" r="1" fill="currentColor"/>
          <circle cx="16" cy="10" r="1" fill="currentColor"/>
          <path d="M6 16h12" stroke="currentColor" strokeWidth="2"/>
          <path d="M9 20h6" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      ),
      title: 'AI Assistant',
      description: 'Environmental chatbot for guidance and waste management tips',
      color: '#FF9500',
      bgColor: 'rgba(255, 149, 0, 0.1)'
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #34C759 0%, #52D765 50%, #D4F4DD 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-lg)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Enhanced Background Elements */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
        animation: 'float 20s ease-in-out infinite'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '-30%',
        right: '-30%',
        width: '60%',
        height: '60%',
        background: 'radial-gradient(circle, rgba(52, 199, 89, 0.1) 0%, transparent 70%)',
        animation: 'float 15s ease-in-out infinite reverse'
      }} />

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `particleFloat ${5 + Math.random() * 10}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}

      {/* Main Content */}
      <div className={`fade-in-up ${isVisible ? 'visible' : ''}`} style={{
        textAlign: 'center',
        zIndex: 10,
        maxWidth: '900px',
        margin: '0 auto',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 1s ease-out'
      }}>
        {/* Enhanced Logo with Animation */}
        <div style={{
          fontSize: 'var(--font-size-4xl)',
          marginBottom: 'var(--space-lg)',
          animation: 'logoPulse 3s ease-in-out infinite',
          filter: 'drop-shadow(0 0 20px rgba(52, 199, 89, 0.5))'
        }}>
          ♻️
        </div>

        {/* Main Heading with Solid Color */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: '800',
          color: 'var(--white)',
          marginBottom: 'var(--space-lg)',
          textShadow: '0 4px 20px rgba(0,0,0,0.3)',
          lineHeight: '1.1',
          letterSpacing: '-0.02em'
        }}>
          AISWO Smart Bin
        </h1>

        {/* Enhanced Subtitle */}
        <p style={{
          fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
          color: 'rgba(255,255,255,0.95)',
          marginBottom: 'var(--space-2xl)',
          lineHeight: '1.6',
          textShadow: '0 2px 10px rgba(0,0,0,0.2)',
          fontWeight: '300',
          maxWidth: '600px',
          margin: '0 auto var(--space-2xl) auto'
        }}>
          Revolutionizing waste management with intelligent monitoring, 
          weather alerts, and environmental consciousness powered by AI
        </p>

        {/* Enhanced Features Section */}
        <div style={{
          marginBottom: 'var(--space-2xl)',
          position: 'relative'
        }}>
          {/* Enhanced Feature Cards */}
          <div className="feature-cards" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-lg)',
            marginBottom: 'var(--space-lg)',
            maxWidth: '1100px',
            flexWrap: 'nowrap'
          }}>
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card"
                style={{
                  background: 'var(--white)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-2xl)',
                  border: '1px solid rgba(52, 199, 89, 0.2)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  transform: currentFeature === index ? 'scale(1.02) translateY(-8px)' : 'scale(1)',
                  boxShadow: currentFeature === index 
                    ? '0 25px 50px rgba(52, 199, 89, 0.25)' 
                    : '0 10px 30px rgba(0,0,0,0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  flex: '1',
                  minWidth: '280px',
                  maxWidth: '320px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.02) translateY(-12px)';
                  e.target.style.boxShadow = '0 30px 60px rgba(52, 199, 89, 0.3)';
                  e.target.style.borderColor = feature.color;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = currentFeature === index ? 'scale(1.02) translateY(-8px)' : 'scale(1)';
                  e.target.style.boxShadow = currentFeature === index 
                    ? '0 25px 50px rgba(52, 199, 89, 0.25)' 
                    : '0 10px 30px rgba(0,0,0,0.1)';
                  e.target.style.borderColor = 'rgba(52, 199, 89, 0.2)';
                }}
              >
                {/* Icon Container */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: 'var(--radius-lg)',
                  background: feature.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--space-lg)',
                  border: `2px solid ${feature.color}20`,
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ 
                    color: feature.color,
                    transition: 'all 0.3s ease'
                  }}>
                    {feature.icon}
                  </div>
                </div>
                
                {/* Content */}
                <div>
                  <h3 style={{ 
                    color: 'var(--text-primary)', 
                    marginBottom: 'var(--space-md)',
                    fontSize: 'var(--font-size-xl)',
                    fontWeight: '700',
                    lineHeight: '1.3'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: 'var(--font-size-base)',
                    lineHeight: '1.6',
                    marginBottom: 'var(--space-lg)'
                  }}>
                    {feature.description}
                  </p>
                  
                  {/* Learn More Link */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    color: feature.color,
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    Learn More
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                
                {/* Decorative Element */}
                <div style={{
                  position: 'absolute',
                  top: 'var(--space-lg)',
                  right: 'var(--space-lg)',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: `${feature.color}10`,
                  opacity: 0.3
                }} />
              </div>
            ))}
          </div>

          {/* Feature Indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-sm)',
            marginTop: 'var(--space-lg)'
          }}>
            {features.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: currentFeature === index 
                    ? 'var(--white)' 
                    : 'rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onClick={() => setCurrentFeature(index)}
              />
            ))}
          </div>
        </div>

        {/* Enhanced CTA Buttons */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-lg)',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: 'var(--space-2xl)'
        }}>
          <Link 
            to="/dashboard" 
            className="btn btn-primary"
            style={{
              padding: 'var(--space-lg) var(--space-2xl)',
              fontSize: 'var(--font-size-lg)',
              fontWeight: '700',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              color: 'var(--primary-green)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
              transform: 'translateY(0)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '1px solid rgba(255,255,255,0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-6px) scale(1.02)';
              e.target.style.boxShadow = '0 20px 60px rgba(0,0,0,0.35)';
              e.target.style.background = 'linear-gradient(135deg, #ffffff 0%, #e8f8ec 100%)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 12px 40px rgba(0,0,0,0.25)';
              e.target.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Get Started
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transition: 'transform 0.3s ease' }}>
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>

          <Link 
            to="/weather" 
            className="btn btn-secondary"
            style={{
              padding: 'var(--space-lg) var(--space-2xl)',
              fontSize: 'var(--font-size-lg)',
              fontWeight: '700',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              background: 'rgba(255,255,255,0.1)',
              color: 'var(--white)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: 'var(--radius-xl)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
              transform: 'translateY(0)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.borderColor = 'rgba(255,255,255,0.5)';
              e.target.style.transform = 'translateY(-6px) scale(1.02)';
              e.target.style.boxShadow = '0 20px 60px rgba(0,0,0,0.35)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.borderColor = 'rgba(255,255,255,0.3)';
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 12px 40px rgba(0,0,0,0.25)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
              <path d="M19 15L20.09 18.26L23 19L20.09 19.74L19 23L17.91 19.74L15 19L17.91 18.26L19 15Z" fill="currentColor" opacity="0.6"/>
            </svg>
            Weather Forecast
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transition: 'transform 0.3s ease' }}>
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        {/* Simple Stats Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 'var(--space-2xl)',
          flexWrap: 'wrap',
          marginTop: 'var(--space-2xl)',
          maxWidth: '800px',
          margin: 'var(--space-2xl) auto 0 auto'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: 'var(--font-size-3xl)', 
              fontWeight: '800', 
              color: 'var(--white)',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              marginBottom: 'var(--space-xs)'
            }}>
              100+
            </div>
            <div style={{ 
              color: 'rgba(255,255,255,0.9)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: '500'
            }}>
              Smart Bins
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: 'var(--font-size-3xl)', 
              fontWeight: '800', 
              color: 'var(--white)',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              marginBottom: 'var(--space-xs)'
            }}>
              24/7
            </div>
            <div style={{ 
              color: 'rgba(255,255,255,0.9)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: '500'
            }}>
              Monitoring
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: 'var(--font-size-3xl)', 
              fontWeight: '800', 
              color: 'var(--white)',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              marginBottom: 'var(--space-xs)'
            }}>
              99%
            </div>
            <div style={{ 
              color: 'rgba(255,255,255,0.9)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: '500'
            }}>
              Efficiency
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: 'var(--font-size-3xl)', 
              fontWeight: '800', 
              color: 'var(--white)',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              marginBottom: 'var(--space-xs)'
            }}>
              AI
            </div>
            <div style={{ 
              color: 'rgba(255,255,255,0.9)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: '500'
            }}>
              Powered
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes logoPulse {
          0%, 100% { 
            transform: scale(1);
            filter: drop-shadow(0 0 20px rgba(52, 199, 89, 0.5));
          }
          50% { 
            transform: scale(1.1);
            filter: drop-shadow(0 0 30px rgba(52, 199, 89, 0.8));
          }
        }
        
        @keyframes particleFloat {
          0% { 
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% { 
            opacity: 1;
          }
          90% { 
            opacity: 1;
          }
          100% { 
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .fade-in-up {
          animation: fadeInUp 1s ease-out;
        }
        
        .slide-in-right {
          animation: slideInRight 0.8s ease-out 0.3s both;
        }
        
        .visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        
        /* Enhanced hover effects */
        .btn:hover svg:last-child {
          transform: translateX(4px);
        }
        
        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .feature-cards {
            flex-wrap: wrap !important;
            gap: var(--space-md) !important;
          }
          .feature-card {
            min-width: 250px !important;
            max-width: 300px !important;
          }
        }
        
        @media (max-width: 768px) {
          .fade-in-up {
            max-width: 95%;
          }
          .feature-cards {
            flex-direction: column !important;
            align-items: center !important;
          }
          .feature-card {
            width: 100% !important;
            max-width: 350px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
