import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const CACHE_KEY = 'stock_carousel_cache';

const DEFAULT_STOCKS = [
  { ticker: 'ONDS', sector: 'Defense' },
  { ticker: 'QBTS', sector: 'Quantum' },
  { ticker: 'JOBY', sector: 'Aviation' },
  { ticker: 'CIFR', sector: 'Datacenter' },
  { ticker: 'AMPX', sector: 'Battery' },
  { ticker: 'LUNR', sector: 'Space' },
  { ticker: 'SERV', sector: 'Robotics' },
  { ticker: 'SMR', sector: 'Nuclear' },
  { ticker: 'HIMS', sector: 'Healthcare' },
  { ticker: 'MARA', sector: 'Crypto' },
  { ticker: 'ZETA', sector: 'AI' },
  { ticker: 'SOFI', sector: 'Finance' },
  { ticker: 'UAMY', sector: 'Minerals' },
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
  const cached = loadCachedStocks();
  const [stocks, setStocks] = useState(cached || DEFAULT_STOCKS.map(s => ({ ...s, price: null, change: null })));
  const retryTimer = useRef(null);

  useEffect(() => {
    const fetchStockData = async (attempt = 0) => {
      const tickers = DEFAULT_STOCKS.map(s => s.ticker);
      try {
        // 90s timeout — long enough to survive Render's cold start (~60s)
        const res = await axios.post(`${BACKEND_URL}/api/stocks/batch`, tickers, { timeout: 90000 });
        const priceMap = {};
        res.data.forEach(q => { priceMap[q.ticker] = q; });

        setStocks(prev => {
          const updated = prev.map(stock => {
            const q = priceMap[stock.ticker];
            return q ? { ...stock, price: q.price, change: q.change_percent } : stock;
          });
          saveCachedStocks(updated);
          return updated;
        });
      } catch (error) {
        console.error('Stock fetch failed:', error.message);
        // Retry delays: 70s then 90s — after cold start should be warm by then
        const delays = [70000, 90000];
        if (attempt < delays.length) {
          retryTimer.current = setTimeout(() => fetchStockData(attempt + 1), delays[attempt]);
        }
      }
    };

    fetchStockData();
    const interval = setInterval(() => fetchStockData(), 300000);
    return () => {
      clearInterval(interval);
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, []);

  const allStocks = [...stocks, ...stocks];

  return (
    <div className="stock-carousel-container">
      <div className="stock-ticker-wrapper">
        <div className="stock-ticker">
          {allStocks.map((stock, index) => {
            const loaded = stock.price !== null;
            return (
              <div key={index} className="stock-ticker-item">
                <span className="ticker-symbol">{stock.ticker}</span>
                <span className="ticker-divider"></span>
                <span className="ticker-sector">{stock.sector}</span>
                <span className="ticker-divider"></span>
                {loaded ? (
                  <>
                    <span className="ticker-price" style={{ color: 'var(--text-primary)' }}>
                      ${stock.price.toFixed(2)}
                    </span>
                    <span className={`ticker-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                    </span>
                  </>
                ) : (
                  <span className="ticker-loading">loading...</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StockCarousel;
