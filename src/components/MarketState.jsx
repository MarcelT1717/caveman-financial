import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Updated with April 2026 government reports
const indicators = [
  {
    name: 'PPI',
    label: 'Producer Price Index',
    current: 6.0, previous: 3.5, change: '+1.4% MoM', direction: 'up',
    sentiment: 'negative', unit: '%',
    trendHeadline: 'Largest Monthly Rise Since March 2022',
    description: 'Up 1.4% in April — 6.0% annual rate (12-month)',
    context: 'Largest 12-month increase since December 2022. Services +1.2%, goods +2.0%',
    sparkline: [22, 28, 24, 36, 42, 52, 64, 76],
  },
  {
    name: 'Unemployment',
    label: 'Unemployment Rate',
    current: 4.3, previous: 4.3, change: '0%', direction: 'up',
    sentiment: 'positive', unit: '%',
    trendHeadline: 'Labor Market Holding Steady',
    description: 'Unchanged at 4.3% in April — 7.4M unemployed',
    context: '+115k nonfarm payrolls; gains in healthcare, transport & retail. Federal employment declining',
    sparkline: [52, 48, 55, 46, 50, 44, 46, 43],
  },
  {
    name: 'CPI',
    label: 'Consumer Price Index',
    current: 3.8, previous: 2.4, change: '+0.6% MoM', direction: 'up',
    sentiment: 'negative', unit: '%',
    trendHeadline: 'Inflation Reaccelerating Above Target',
    description: 'Rose 0.6% in April — 3.8% over past 12 months',
    context: 'Energy +3.8%, shelter +0.6%, food +0.5%. Moving away from Fed\'s 2% target',
    sparkline: [40, 44, 38, 48, 54, 60, 68, 74],
  },
  {
    name: 'GDP Growth',
    label: 'Quarterly GDP',
    current: 1.6, previous: 0.5, change: '+1.1%', direction: 'up',
    sentiment: 'negative', unit: '%',
    trendHeadline: 'Recovery From Q4 Weakness',
    description: 'Q1 2026 grew at 1.6% annualized — up from 0.5% in Q4 2025',
    context: 'Revised down from 2.0% advance estimate. Inflation pressures and geopolitical risks weigh on growth',
    sparkline: [80, 72, 76, 62, 56, 28, 22, 38],
  },
  {
    name: 'S&P P/E',
    label: 'S&P 500 P/E Ratio',
    current: 32.57, previous: 32.81, change: '-0.72%', direction: 'down',
    sentiment: 'negative', unit: '',
    trendHeadline: '2× Historical Average — Overvalued',
    description: 'At 32.57 vs historical mean of 16.22',
    context: 'Down slightly from prior close but remains at extreme valuation. Median: 15.07, all-time max: 123.73',
    sparkline: [55, 62, 66, 74, 80, 82, 76, 78],
  },
  {
    name: 'PCE',
    label: 'Personal Consumption Expenditures',
    current: 3.5, previous: 2.8, change: '+0.7%', direction: 'up',
    sentiment: 'negative', unit: '%',
    trendHeadline: 'Highest Inflation Since May 2023',
    description: 'PCE rose to 3.5% YoY in March 2026 — up from 2.8% in February',
    context: 'Highest annual rate since May 2023. Fed target is 2%. Analysts project 3.7% by end of quarter',
    sparkline: [32, 36, 34, 42, 46, 54, 62, 68],
  },
];

const MarketState = () => (
  <div className="ms-grid">
    {indicators.map((ind, i) => {
      const pos = ind.sentiment === 'positive';
      const borderColor = pos ? '#22c55e' : '#ef4444';
      const cls = pos ? 'pos' : 'neg';

      return (
        <div key={i} className="ms-card" style={{ borderLeftColor: borderColor }}>

          {/* Top row: name label + status dot */}
          <div className="ms-top-row">
            <div>
              <div className="ms-name">{ind.name}</div>
              <div className="ms-label">{ind.label}</div>
            </div>
            <span className={`ms-dot ${cls}`} />
          </div>

          {/* Sparkline */}
          <div className="ms-sparkline">
            {ind.sparkline.map((h, j) => (
              <div key={j} className={`ms-bar ${cls}`} style={{ height: `${h}%` }} />
            ))}
          </div>

          {/* Main value */}
          <div className="ms-value">{ind.current}{ind.unit}</div>

          {/* Change badge + previous inline */}
          <div className="ms-change-row">
            <div className={`ms-badge ${cls}`}>
              {ind.direction === 'up'
                ? <TrendingUp className="w-3.5 h-3.5" />
                : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{ind.change}</span>
            </div>
            <span className="ms-prev">Prev: {ind.previous}{ind.unit}</span>
          </div>

          {/* Trend headline */}
          <p className="ms-trend">{ind.trendHeadline}</p>

          {/* Description + context */}
          <p className="ms-desc">{ind.description}</p>
          <p className="ms-context">{ind.context}</p>
        </div>
      );
    })}
  </div>
);

export default MarketState;
