import React, { useState, useEffect } from 'react';
import { Plane, Cpu, Rocket, Bot, Zap, Atom, Mountain, Heart, Brain, Bitcoin, TrendingUp, BarChart2, Newspaper, ArrowRight, Mail } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Sectors = () => {
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);

  const analysisFactors = [
    {
      icon: TrendingUp,
      title: 'Volume Analysis',
      description: 'Tracking unusual trading volume and institutional activity to identify emerging momentum'
    },
    {
      icon: BarChart2,
      title: 'Technical Patterns',
      description: 'Chart analysis and price action to pinpoint optimal entry and exit points'
    },
    {
      icon: Newspaper,
      title: 'News & Catalysts',
      description: 'Monitoring sector developments, earnings, and market-moving events'
    }
  ];

  const allSectors = [
    {
      name: 'Aviation',
      icon: Plane,
      description: 'Electric vertical takeoff and landing (eVTOL) and advanced air mobility',
      stocks: ['JOBY', 'ACHR', 'FLY'],
    },
    {
      name: 'Quantum',
      icon: Cpu,
      description: 'Next-generation quantum processors and computing as a service',
      stocks: ['RGTI', 'QBTS', 'IONQ'],
    },
    {
      name: 'Space',
      icon: Rocket,
      description: 'Lunar infrastructure, satellite connectivity, and space exploration',
      stocks: ['LUNR', 'RDW', 'PL'],
    },
    {
      name: 'Robotics',
      icon: Bot,
      description: 'Advanced robotics for service, manufacturing, and logistics',
      stocks: ['SERV', 'RR', 'KRKNF'],
    },
    {
      name: 'Energy',
      icon: Zap,
      description: 'Next-gen battery technology and energy storage solutions',
      stocks: ['QS', 'EOSE', 'TE'],
    },
    {
      name: 'Nuclear',
      icon: Atom,
      description: 'Small modular reactors and next-generation nuclear power',
      stocks: ['SMR', 'NNE', 'OKLO'],
    },
    {
      name: 'Minerals',
      icon: Mountain,
      description: 'Rare earth elements and critical minerals for technology',
      stocks: ['USAR', 'UAMY', 'TMC'],
    },
    {
      name: 'Healthcare',
      icon: Heart,
      description: 'Telemedicine, gene editing, and precision healthcare',
      stocks: ['HIMS', 'OSCR', 'CRSP'],
    },
    {
      name: 'AI',
      icon: Brain,
      description: 'Artificial intelligence platforms and data analytics',
      stocks: ['ZETA', 'BBAI', 'RZLV'],
    },
    {
      name: 'Crypto',
      icon: Bitcoin,
      description: 'Bitcoin mining, crypto infrastructure, and blockchain',
      stocks: ['CIFR', 'WULF', 'MARA'],
    },
  ];

  useEffect(() => {
    const fetchAllStocks = async () => {
      setLoading(true);
      const allTickers = allSectors.flatMap(sector => sector.stocks);
      
      try {
        const promises = allTickers.map(ticker =>
          axios.get(`${BACKEND_URL}/api/stocks/quote/${ticker}`)
            .then(res => ({ [ticker]: res.data }))
            .catch(err => {
              console.error(`Error fetching ${ticker}:`, err);
              return { [ticker]: null };
            })
        );
        
        const results = await Promise.all(promises);
        const dataMap = Object.assign({}, ...results);
        setStockData(dataMap);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStocks();
    const interval = setInterval(fetchAllStocks, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background */}
      <section className="sectors-hero">
        <div className="sectors-hero-overlay"></div>
        <div className="container">
          <div className="sectors-hero-content">
            <h1 className="sectors-hero-title">
              Emerging Markets
              <span className="sectors-hero-subtitle">We're Closely Watching</span>
            </h1>
            <p className="sectors-hero-description">
              High-conviction opportunities in breakthrough sectors with significant growth potential
            </p>
          </div>
        </div>
      </section>

      {/* Analysis Factors Section */}
      <section className="analysis-factors-section">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="display-md mb-4">Our Analysis Framework</h2>
            <p className="body-lg text-text-secondary max-w-2xl mx-auto">
              Three key pillars driving our sector and stock selection process
            </p>
          </div>

          <div className="analysis-factors-grid">
            {analysisFactors.map((factor, index) => {
              const Icon = factor.icon;
              return (
                <div key={index} className="analysis-factor-card">
                  <div className="factor-icon-wrapper">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="factor-title">{factor.title}</h3>
                  <p className="factor-description">{factor.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider"></div>

      {/* Sectors Grid */}
      <section className="container py-20">
        <div className="text-center mb-16">
          <h2 className="display-md mb-4">Investment Sectors</h2>
          <p className="body-lg text-text-secondary max-w-3xl mx-auto">
            Curated small cap opportunities across 10 high-potential sectors with real-time market data
          </p>
        </div>

        <div className="sectors-modern-grid">
          {allSectors.map((sector, sectorIndex) => {
            const Icon = sector.icon;
            return (
              <div key={sectorIndex} className="sector-modern-card">
                {/* Sector Header */}
                <div className="sector-modern-header">
                  <div className="sector-modern-icon">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="sector-modern-title">{sector.name}</h3>
                    <p className="sector-modern-description">{sector.description}</p>
                  </div>
                </div>

                {/* Stocks List */}
                <div className="stocks-modern-list">
                  {sector.stocks.map((ticker, index) => {
                    const data = stockData[ticker];
                    const isLoading = loading || !data;
                    
                    return (
                      <div key={ticker} className="stock-modern-item">
                        <div className="stock-modern-left">
                          <div className="stock-modern-rank">#{index + 1}</div>
                          <div>
                            <div className="stock-modern-ticker">{ticker}</div>
                            <div className="stock-modern-name">
                              {isLoading ? 'Loading...' : (data?.name || ticker)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="stock-modern-right">
                          <div className="stock-modern-price">
                            {isLoading ? '--' : `$${data?.price?.toFixed(2) || '0.00'}`}
                          </div>
                          <div className={`stock-modern-change ${isLoading ? '' : data?.change_percent >= 0 ? 'positive' : 'negative'}`}>
                            {isLoading ? '--' : `${data?.change_percent >= 0 ? '+' : ''}${data?.change_percent?.toFixed(2)}%`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Newsletter CTA Section */}
      <section className="container py-20">
        <div className="sectors-cta-card">
          <div className="sectors-cta-content">
            <h2 className="sectors-cta-title">And More...</h2>
            <p className="sectors-cta-description">
              Get deeper analysis, additional sector picks, and exclusive insights delivered weekly to your inbox
            </p>
            <Link to="/" className="btn-primary btn-large">
              <Mail className="w-5 h-5 mr-2" />
              Subscribe to Our Newsletter
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sectors;
