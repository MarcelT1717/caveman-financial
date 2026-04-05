import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const CACHE_KEY = 'stock_carousel_cache';

const DEFAULT_STOCKS = [
  { ticker: 'ONDS', sector: 'Defense', change: 0, price: 0 },
  { ticker: 'QBTS', sector: 'Quantum', change: 0, price: 0 },
  { ticker: 'JOBY', sector: 'Aviation', change: 0, price: 0 },
  { ticker: 'CIFR', sector: 'Datacenter', change: 0, price: 0 },
  { ticker: 'AMPX', sector: 'Battery', change: 0, price: 0 },
  { ticker: 'LUNR', sector: 'Space', change: 0, price: 0 },
  { ticker: 'SERV', sector: 'Robotics', change: 0, price: 0 },
  { ticker: 'SMR', sector: 'Nuclear', change: 0, price: 0 },
  { ticker: 'HIMS', sector: 'Healthcare', change: 0, price: 0 },
  { ticker: 'MARA', sector: 'Crypto', change: 0, price: 0 },
  { ticker: 'ZETA', sector: 'AI', change: 0, price: 0 },
  { ticker: 'SOFI', sector: 'Finance', change: 0, price: 0 },
  { ticker: 'UAMY', sector: 'Minerals', change: 0, price: 0 },
];

function loadCachedStocks() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

function saveCachedStocks(stocks) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(stocks));
  } catch (_) {}
}

const StockCarousel = () => {
  const [stocks, setStocks] = useState(() => loadCachedStocks() || DEFAULT_STOCKS);

  useEffect(() => {
    const fetchStockData = async () => {
      const tickers = DEFAULT_STOCKS.map(s => s.ticker);

      try {
        const res = await axios.post(`${BACKEND_URL}/api/stocks/batch`, tickers);
        const results = res.data;

        const priceMap = {};
        results.forEach(q => { priceMap[q.ticker] = q; });

        setStocks(prev => {
          const updated = prev.map(stock => {
            const q = priceMap[stock.ticker];
            return q ? { ...stock, price: q.price, change: q.change_percent } : stock;
          });
          saveCachedStocks(updated);
          return updated;
        });
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    };

    fetchStockData();
    const interval = setInterval(fetchStockData, 300000);
    return () => clearInterval(interval);
  }, []);

  // Duplicate stocks for infinite scroll effect
  const allStocks = [...stocks, ...stocks];

  return (
    <div className="stock-carousel-container">
      <div className="stock-ticker-wrapper">
        <div className="stock-ticker">
          {allStocks.map((stock, index) => (
            <div key={index} className="stock-ticker-item">
              <span className="ticker-symbol">{stock.ticker}</span>
              <span className="ticker-divider"></span>
              <span className="ticker-sector">{stock.sector}</span>
              <span className="ticker-divider"></span>
              <span className="ticker-price" style={{ color: 'var(--text-primary)' }}>
                ${stock.price.toFixed(2)}
              </span>
              <span className={`ticker-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockCarousel;
