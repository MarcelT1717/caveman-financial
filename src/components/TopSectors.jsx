import React, { useState, useEffect } from 'react';
import { Cpu, Rocket, Bot } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const sectors = [
  {
    name: 'Quantum Computing',
    icon: Cpu,
    description: 'Revolutionary computing power enabling breakthroughs in cryptography, drug discovery, and complex optimisation.',
    topStocks: ['RGTI', 'IONQ', 'QBTS'],
    growth: '+127%',
    rank: 1,
    label: '1st',
  },
  {
    name: 'Space Technology',
    icon: Rocket,
    description: 'Commercial space exploration, satellite internet, and lunar infrastructure reshaping global connectivity.',
    topStocks: ['ASTS', 'LUNR', 'PL'],
    growth: '+94%',
    rank: 2,
    label: '2nd',
  },
  {
    name: 'Robotics & AI',
    icon: Bot,
    description: 'Advanced robotics and AI transforming manufacturing, healthcare, and everyday automation at scale.',
    topStocks: ['SERV', 'RR', 'KRKNF'],
    growth: '+78%',
    rank: 3,
    label: '3rd',
  },
];

// left=rank2, center=rank1, right=rank3
const podiumOrder = [
  sectors.find(s => s.rank === 2),
  sectors.find(s => s.rank === 1),
  sectors.find(s => s.rank === 3),
];

const RANK_COLORS = {
  1: { base: 'linear-gradient(160deg,#c6aa83 0%,#9a7a50 100%)', border: 'rgba(198,170,131,0.6)', glow: 'rgba(198,170,131,0.25)', text: '#c6aa83' },
  2: { base: 'linear-gradient(160deg,#b0bec5 0%,#78909c 100%)', border: 'rgba(176,190,197,0.5)', glow: 'rgba(176,190,197,0.1)',  text: '#b0bec5' },
  3: { base: 'linear-gradient(160deg,#cd8e4e 0%,#8d5a2a 100%)', border: 'rgba(205,142,78,0.45)',  glow: 'rgba(205,142,78,0.1)',   text: '#cd8e4e' },
};

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

const TopSectors = () => {
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

  return (
    <div className="podium-wrapper">
      {podiumOrder.map(sector => {
        const Icon = sector.icon;
        const colors = RANK_COLORS[sector.rank];

        return (
          <div key={sector.rank} className={`podium-entry podium-rank-${sector.rank}`}>

            {/* Card */}
            <div
              className="podium-card-v2"
              style={{ borderColor: colors.border, boxShadow: sector.rank === 1 ? `0 0 50px ${colors.glow}` : 'none' }}
            >
              {/* Faded rank watermark */}
              <div className="podium-watermark" style={{ color: colors.text }}>{sector.rank}</div>

              {/* Medal + icon row */}
              <div className="podium-card-top">
                <div className="podium-medal">{MEDALS[sector.rank]}</div>
                <div className="podium-icon" style={{ background: `${colors.glow.replace('0.25','0.18').replace('0.1','0.12')}`, color: colors.text }}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              <h3 className="podium-sector-name" style={{ color: colors.text }}>{sector.name}</h3>
              <p className="podium-sector-desc">{sector.description}</p>

              {/* Stocks */}
              <div className="podium-stocks-list">
                {sector.topStocks.map(ticker => {
                  const d = stockPrices[ticker];
                  const pos = d && d.change_percent >= 0;
                  return (
                    <div key={ticker} className="podium-stock-row">
                      <span className="podium-stock-ticker">{ticker}</span>
                      <span className="podium-stock-price">
                        {d ? `$${d.price.toFixed(2)}` : '—'}
                      </span>
                      {d && (
                        <span className={`podium-stock-change ${pos ? 'pos' : 'neg'}`}>
                          {pos ? '+' : ''}{d.change_percent.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* YTD growth */}
              <div className="podium-growth-row">
                <span className="podium-growth-label">YTD Average</span>
                <span className="podium-growth-value" style={{ color: colors.text }}>{sector.growth}</span>
              </div>
            </div>

            {/* Podium base platform */}
            <div className="podium-base" style={{ background: colors.base }}>
              <span className="podium-base-label">{sector.label}</span>
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default TopSectors;
