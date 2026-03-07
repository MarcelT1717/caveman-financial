import React from 'react';
import { TrendingUp, TrendingDown, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const MarketState = () => {
  // Enhanced data with contextual descriptions
  const indicators = [
    {
      name: 'PPI',
      label: 'Producer Price Index',
      current: 2.9,
      previous: 3.0,
      change: "+0.5%",
      direction: "up",
      color: "negative",
      sentiment: 'negative',
      unit: '%',
      description: 'Increased 0.5% in January - Inflationary pressures rising',
      context: 'Higher producer costs suggest negative inflation outlook',
      angle: '-2deg',
    },
    {
      name: 'Unemployment',
      label: 'Unemployment Rate',
      current: 4.3,
      previous: 4.4,
      change: "-0.1%",
      direction: "down",
      color: "positive",
      sentiment: 'positive',
      unit: '%',
      description: 'Fell to 4.3% in January - Labor market remains unhealthy',
      context: 'Rising over the past year, Job growth decreasing',
      angle: '2deg',
    },
    {
      name: 'CPI',
      label: 'Consumer Price Index',
      current: 2.4,
      previous: 2.7,
      change: "-0.3",
      direction: "down",
      color: "positive",
      sentiment: 'positive',
      unit: '%',
      description: 'Declined from 2.7% in December - Approaching Fed target',
      context: 'All urban cosnumers increased 2.4% over the 12 months ending Jan 26',
      angle: '2deg',
    },
    {
      name: 'GDP Growth',
      label: 'Quarterly GDP',
      current: 1.4,
      previous: 4.4,
      change: "-3.0%",
      direction: "down",
      color: "negative",
      sentiment: 'negative',
      unit: '%',
      description: 'Down from 4.4% growth in Q3 - Slower Economy',
      context: 'Real GDP increased at an annual rate of 1.4% in Q4 of 2025',
      angle: '-2deg',
    },
    {
      name: 'S&P P/E',
      label: 'S&P 500 P/E Ratio',
      current: 29.55,
      previous: 29.55,
      change: "0%",
      direction: "up",
      color: "negative",
      sentiment: 'negative',
      unit: '',
      description: 'High at 29.55 - Market over valued',
      context: 'Above the historical average, high valuation',
      angle: '-2deg',
    },
    {
      name: 'PCE',
      label: 'Personal Consumption Expenditures',
      current: 2.9,
      previous: 2.8,
      change: "+0.1%",
      direction: "up",
      color: "positive",
      sentiment: 'positive',
      unit: '%',
      description: 'Real PCE increased 0.1% in December - Market confidence improving',
      context: 'Personal Income increased $86.2 billion in December',
      angle: '2deg',
    },
  ];

  const getStatusIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <CheckCircle className="w-6 h-6" />;
      case 'negative':
        return <XCircle className="w-6 h-6" />;
      default:
        return <AlertTriangle className="w-6 h-6" />;
    }
  };

  const getStatusColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'status-positive';
      case 'negative':
        return 'status-negative';
      default:
        return 'status-neutral';
    }
  };

  return (
    <div className="market-state-modern">
      <div className="market-indicators-grid">
        {indicators.map((indicator, index) => (
          <div 
            key={index} 
            className={`market-card-modern ${getStatusColor(indicator.sentiment)}`}
            style={{ transform: `rotate(${indicator.angle})` }}
          >
            <div className="market-card-inner">
              {/* Header with Status */}
              <div className="market-card-header">
                <div>
                  <h3 className="market-card-title">{indicator.name}</h3>
                  <p className="market-card-label">{indicator.label}</p>
                </div>
                <div className={`status-badge ${getStatusColor(indicator.sentiment)}`}>
                  {getStatusIcon(indicator.sentiment)}
                </div>
              </div>

              {/* Current Value - Large */}
              <div className="market-card-value">
                {indicator.current}{indicator.unit}
              </div>

              {/* Change Indicator */}
              <div className="market-card-change">
               <div className={`change-indicator ${indicator.color}`}>
                {indicator.direction === "up" ? (
                 <TrendingUp className="w-4 h-4" />
               ) : (
                 <TrendingDown className="w-4 h-4" />
               )}
               <span>{indicator.change}</span>
             </div>
           </div>

              {/* Description */}
              <div className="market-card-description">
                <p className="description-main">{indicator.description}</p>
                <p className="description-context">{indicator.context}</p>
              </div>

              {/* Previous Value */}
              <div className="market-card-footer">
                <span className="footer-label">Previous:</span>
                <span className="footer-value">{indicator.previous}{indicator.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketState;
