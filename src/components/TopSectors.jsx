import React, { useState, useEffect } from 'react';
import { Cpu, Rocket, Bot } from 'lucide-react';

const TopSectors = () => {
  const sectors = [
    {
      name: 'Quantum Computing',
      icon: Cpu,
      description: 'Revolutionary computing power enabling breakthroughs in cryptography, drug discovery, and complex problem-solving.',
      topStocks: ['RGTI', 'IONQ', 'QBTS'],
      growth: '+127%',
      rank: 1,
    },
    {
      name: 'Space Technology',
      icon: Rocket,
      description: 'Commercial space exploration, satellite internet, and lunar infrastructure development reshaping connectivity.',
      topStocks: ['ASTS', 'LUNR', 'PL'],
      growth: '+94%',
      rank: 2,
    },
    {
      name: 'Robotics & AI',
      icon: Bot,
      description: 'Advanced robotics and artificial intelligence transforming manufacturing, healthcare, and everyday automation.',
      topStocks: ['SERV', 'RR', 'KRKNF'],
      growth: '+78%',
      rank: 3,
    },
  ];

  const [stockPrices, setStockPrices] = useState({});

  useEffect(() => {
    const tickers = sectors.flatMap(s => s.topStocks);

    const fetchPrices = async () => {
      try {
        const responses = await Promise.all(
          tickers.map(ticker =>
            fetch(`${process.env.REACT_APP_BACKEND_URL}/api/stocks/quote/${ticker}`).then(res => res.json())
          )
        );

        const prices = {};
        responses.forEach(stock => {
          prices[stock.ticker] = stock;
        });

        setStockPrices(prices);
      } catch (err) {
        console.error('Stock fetch error:', err);
      }
    };

    fetchPrices();
  }, []);

  const podiumOrder = [
    sectors.find(s => s.rank === 2),
    sectors.find(s => s.rank === 1),
    sectors.find(s => s.rank === 3),
  ];

  return (
    <div className="podium-container">
      {podiumOrder.map(sector => {
        const Icon = sector.icon;
        return (
          <div key={sector.rank} className={`podium-card rank-${sector.rank}`}>
            <div className="rank-badge">
              {sector.rank === 1 && '🥇'}
              {sector.rank === 2 && '🥈'}
              {sector.rank === 3 && '🥉'}
            </div>

            <div className="sector-icon-wrapper">
              <Icon className="w-8 h-8" />
            </div>

            <h3 className="h3 mb-3 mt-6">{sector.name}</h3>
            <p className="body-md text-text-secondary mb-6">{sector.description}</p>

            <div className="mb-6">
              <div className="body-sm text-text-muted mb-2">Top Holdings</div>
              <div className="flex flex-wrap gap-2">
                {sector.topStocks.map((stock, idx) => {
                  const data = stockPrices[stock];
                  return (
                    <span key={idx} className="stock-badge">
                      {stock}
                      {data && (
                        <span className="ml-1 text-xs">
                          ${data.price} ({data.change_percent > 0 ? '+' : ''}{data.change_percent}%)
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="sector-growth-indicator">
              <div className="flex justify-between items-end">
                <div>
                  <div className="body-sm text-text-muted">YTD Average</div>
                  <div className="display-sm text-accent-primary">{sector.growth}</div>
                </div>
                <div className="growth-chart-placeholder">
                  <svg viewBox="0 0 80 30" className="w-20 h-8">
                    <polyline
                      points="0,28 20,22 40,15 60,10 80,2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-accent-primary"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TopSectors;