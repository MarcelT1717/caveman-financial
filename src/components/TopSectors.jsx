import React, { useState, useEffect } from 'react';
import { Cpu, Rocket, Bot, Shield, Zap } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const sectors = [
  {
    name: 'Quantum Computing', icon: Cpu, category: 'tech',
    description: 'Revolutionary computing power enabling breakthroughs in cryptography, drug discovery, and complex optimisation.',
    topStocks: ['RGTI', 'IONQ', 'QBTS'], growth: '+127%', rank: 1,
  },
  {
    name: 'Space Technology', icon: Rocket, category: 'space',
    description: 'Commercial space exploration, satellite internet, and lunar infrastructure reshaping global connectivity.',
    topStocks: ['ASTS', 'LUNR', 'PL'], growth: '+94%', rank: 2,
  },
  {
    name: 'Robotics & AI', icon: Bot, category: 'tech',
    description: 'Advanced robotics and AI transforming manufacturing, healthcare, and everyday automation at scale.',
    topStocks: ['SERV', 'RR', 'KRKNF'], growth: '+78%', rank: 3,
  },
  {
    name: 'Defense Tech', icon: Shield, category: 'space',
    description: 'Next-generation defense systems, autonomous drones, and AI-powered surveillance reshaping national security.',
    topStocks: ['KTOS', 'CACI', 'PLTR'], growth: '+62%', rank: 4,
  },
  {
    name: 'Clean Energy', icon: Zap, category: 'energy',
    description: 'Solar, wind, and battery storage innovations driving the global transition away from fossil fuels.',
    topStocks: ['ARRY', 'STEM', 'FSLR'], growth: '+41%', rank: 5,
  },
];

const FILTERS = ['All', 'Tech', 'Energy', 'Space'];

const TopSectors = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [stockPrices, setStockPrices] = useState({});

  useEffect(() => {
    const allTickers = sectors.flatMap(s => s.topStocks);
    axios.post(`${BACKEND_URL}/api/stocks/batch`, allTickers)
      .then(res => {
        const map = {};
        res.data.forEach(q => { map[q.ticker] = q; });
        setStockPrices(map);
      })
      .catch(err => console.error('TopSectors fetch error:', err));
  }, []);

  const filtered = activeFilter === 'All'
    ? sectors
    : sectors.filter(s => s.category === activeFilter.toLowerCase());

  const featured = filtered.slice(0, 2);
  const compact  = filtered.slice(2);

  return (
    <div>
      {/* Filter bar */}
      <div className="sv3-filter-bar">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`sv3-filter-btn ${activeFilter === f ? 'active' : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Asymmetric grid */}
      <div
        className="sv3-grid"
        style={{ gridTemplateColumns: compact.length > 0 ? '3fr 2fr' : '1fr' }}
      >
        {/* Left — large featured cards */}
        {featured.length > 0 && (
          <div className="sv3-left">
            {featured.map(sector => {
              const Icon = sector.icon;
              return (
                <div key={sector.rank} className="sv3-featured-card">
                  <span className="sv3-rank-bg">{sector.rank}</span>

                  <div className="sv3-featured-header">
                    <div className="sv3-icon-wrap">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="sv3-header-text">
                      <h3 className="sv3-sector-name">{sector.name}</h3>
                      <p className="sv3-sector-desc">{sector.description}</p>
                    </div>
                    <span className="sv3-growth-badge">{sector.growth} YTD</span>
                  </div>

                  <div className="sv3-stock-table">
                    {sector.topStocks.map(ticker => {
                      const d = stockPrices[ticker];
                      const pos = d && d.change_percent >= 0;
                      return (
                        <div key={ticker} className="sv3-stock-row">
                          <span className="sv3-ticker">{ticker}</span>
                          <span className="sv3-price">
                            {d ? `$${d.price.toFixed(2)}` : '—'}
                          </span>
                          <span className={`sv3-change ${d ? (pos ? 'pos' : 'neg') : 'muted'}`}>
                            {d ? `${pos ? '+' : ''}${d.change_percent.toFixed(2)}%` : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Right — compact cards */}
        {compact.length > 0 && (
          <div className="sv3-right">
            {compact.map(sector => {
              const Icon = sector.icon;
              return (
                <div key={sector.rank} className="sv3-compact-card">
                  <span className="sv3-compact-rank-bg">{sector.rank}</span>

                  <div className="sv3-compact-header">
                    <div className="sv3-compact-icon">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="sv3-compact-name">{sector.name}</span>
                    <span className="sv3-compact-growth">{sector.growth}</span>
                  </div>

                  <p className="sv3-compact-desc">{sector.description}</p>

                  <div className="sv3-compact-tickers">
                    {sector.topStocks.map(ticker => {
                      const d = stockPrices[ticker];
                      const pos = d && d.change_percent >= 0;
                      return (
                        <span
                          key={ticker}
                          className={`sv3-compact-pill ${d ? (pos ? 'pos' : 'neg') : ''}`}
                        >
                          {ticker}{d ? ` ${pos ? '+' : ''}${d.change_percent.toFixed(1)}%` : ''}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopSectors;
