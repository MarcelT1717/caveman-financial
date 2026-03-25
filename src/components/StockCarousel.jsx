import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const StockCarousel = () => {
  const [stocks, setStocks] = useState([
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
  ]);

  useEffect(() => {
    const fetchStockData = async () => {
      const tickers = stocks.map(s => s.ticker);
      
      try {
        const promises = tickers.map(ticker =>
          axios.get(`${BACKEND_URL}/api/stocks/quote/${ticker}`)
            .then(res => res.data)
            .catch(err => {
              console.error(`Error fetching ${ticker}:`, err);
              return null;
            })
        );
        
        const results = await Promise.all(promises);
        
        const updatedStocks = stocks.map((stock, index) => {
          const data = results[index];
          if (data) {
            return {
              ...stock,
              price: data.price,
              change: data.change_percent
            };
          }
          return stock;
        });
        
        setStocks(updatedStocks);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    };

    fetchStockData();
    // Refresh every 5 minutes
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
