import React, { useState, useEffect, useRef } from 'react';
import {
  Plane, Cpu, Rocket, Bot, Zap, Atom, Mountain, Heart, Brain, Bitcoin,
  TrendingUp, BarChart2, Newspaper, ArrowRight, Mail, Radar, Server, Shield,
  DollarSign, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useSubscribe } from '../context/SubscribeContext';
import StockDrawer from '../components/StockDrawer';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Unique color per sector
const SECTOR_COLORS = {
  Aviation:   '#38bdf8',
  Quantum:    '#a78bfa',
  Space:      '#818cf8',
  Robotics:   '#22d3ee',
  Bettery:    '#4ade80',
  Nuclear:    '#fbbf24',
  Minerals:   '#fb923c',
  Healthcare: '#f43f5e',
  AI:         '#c084fc',
  Drone:      '#2dd4bf',
  Datacenter: '#60a5fa',
  Defense:    '#f87171',
  Finance:    '#34d399',
  Crypto:     '#fde047',
};

// Sectors marked as highest-conviction
const TOP_PICKS = new Set(['Quantum', 'AI', 'Space', 'Defense', 'Drone', 'Robotics']);

const CATEGORIES = [
  { key: 'all',     label: 'All Sectors' },
  { key: 'tech',    label: 'Technology',       sectors: ['Quantum', 'AI', 'Datacenter', 'Drone', 'Robotics'] },
  { key: 'energy',  label: 'Energy',           sectors: ['Nuclear', 'Bettery', 'Minerals'] },
  { key: 'defense', label: 'Defense & Space',  sectors: ['Space', 'Aviation', 'Defense'] },
  { key: 'finance', label: 'Finance & Crypto', sectors: ['Finance', 'Crypto'] },
  { key: 'health',  label: 'Healthcare',       sectors: ['Healthcare'] },
];

const allSectors = [
  { name: 'Aviation',   icon: Plane,      description: 'eVTOL and advanced air mobility vehicles',               stocks: ['JOBY', 'ACHR', 'BETA'] },
  { name: 'Quantum',    icon: Cpu,        description: 'Next-gen quantum processors and computing as a service', stocks: ['RGTI', 'QBTS', 'IONQ'] },
  { name: 'Space',      icon: Rocket,     description: 'Lunar infrastructure, satellites, and exploration',      stocks: ['LUNR', 'RDW', 'PL', 'MDA']          },
  { name: 'Robotics',   icon: Bot,        description: 'Advanced robotics for service and logistics',            stocks: ['SERV', 'RR', 'PATH', 'AUR', 'TE']  },
  { name: 'Bettery',    icon: Zap,        description: 'Next-gen battery tech and energy storage solutions',     stocks: ['AMPX', 'QS', 'EOSE']  },
  { name: 'Nuclear',    icon: Atom,       description: 'Small modular reactors and next-gen nuclear power',      stocks: ['SMR', 'RYCEY', 'OKLO'] },
  { name: 'Minerals',   icon: Mountain,   description: 'Rare earth elements and critical minerals for tech',     stocks: ['USAR', 'UAMY', 'UUUU'] },
  { name: 'Healthcare', icon: Heart,      description: 'Telemedicine, gene editing, and precision medicine',     stocks: ['HIMS', 'TEM', 'CRSP']  },
  { name: 'AI',         icon: Brain,      description: 'Artificial intelligence platforms and data analytics',   stocks: ['ZETA', 'BNAI', 'POET', 'SOUN'] },
  { name: 'Drone',      icon: Radar,      description: 'Next-gen drone technology and defense applications',     stocks: ['ONDS', 'KRKNF', 'UMAC']},
  { name: 'Datacenter', icon: Server,     description: 'Data centers and computing infrastructure',              stocks: ['IREN', 'CIFR', 'APLD', 'CORZ', 'NOK'] },
  { name: 'Defense',    icon: Shield,     description: 'Military technology and defense infrastructure',         stocks: ['FLY', 'RCAT', 'KTOS']  },
  { name: 'Finance',    icon: DollarSign, description: 'Financial services and fintech platforms',               stocks: ['FIGR', 'SOFI', 'UPST'] },
  { name: 'Crypto',     icon: Bitcoin,    description: 'Bitcoin mining, crypto infrastructure, and blockchain',  stocks: ['BITF', 'WULF', 'MARA', 'HIVE', 'HGRAF'] },
];

const analysisFactors = [
  {
    step: '01',
    icon: TrendingUp,
    title: 'Volume Analysis',
    description: 'Tracking unusual trading volume and institutional activity to identify emerging momentum before it becomes obvious. We look for volume anomalies that signal smart money positioning ahead of a catalyst.',
    tags: ['Unusual volume', 'Institutional flow', 'Dark pool activity', 'Options flow'],
  },
  {
    step: '02',
    icon: BarChart2,
    title: 'Technical Patterns',
    description: 'Chart analysis and price action to pinpoint optimal entry and exit points with precision and conviction. Technical structure confirms or denies the volume signal before we commit to a position.',
    tags: ['Support & resistance', 'Breakout signals', 'RSI divergence', 'Moving averages'],
  },
  {
    step: '03',
    icon: Newspaper,
    title: 'News & Catalysts',
    description: 'Monitoring sector developments, earnings, and market-moving events that drive asymmetric upside. The catalyst is the match — volume and technicals are the fuel.',
    tags: ['Earnings calendar', 'Regulatory events', 'Contract wins', 'Macro tailwinds'],
  },
];

function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

const Sectors = () => {
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTicker, setSelectedTicker] = useState(null);
  const { openSubscribeModal } = useSubscribe();

  const [gridRef, gridVisible] = useScrollReveal();
  const [frameworkRef, frameworkVisible] = useScrollReveal();

  useEffect(() => {
    const fetchAllStocks = async () => {
      setLoading(true);
      const allTickers = allSectors.flatMap(s => s.stocks);
      try {
        const res = await axios.post(`${BACKEND_URL}/api/stocks/batch`, allTickers);
        const dataMap = {};
        res.data.forEach(q => { dataMap[q.ticker] = q; });
        setStockData(dataMap);
      } catch (err) {
        console.error('Error fetching stock data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStocks();
    const interval = setInterval(fetchAllStocks, 300000);
    return () => clearInterval(interval);
  }, []);

  const activeCat = CATEGORIES.find(c => c.key === activeCategory);
  const filteredSectors = activeCategory === 'all'
    ? allSectors
    : allSectors.filter(s => activeCat?.sectors?.includes(s.name));

  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <section className="sectors-hero-v2">
        <div className="sectors-hero-v2-overlay" />
        <div className="container">
          <div className="sectors-hero-v2-content">
            <div className="sectors-live-badge">
              <span className="pulse-dot-small" />
              Real-Time Market Data
            </div>
            <h1 className="sectors-hero-v2-title">
              Emerging Sectors
              <span className="sectors-hero-v2-accent">We're Closely Watching</span>
            </h1>
            <p className="sectors-hero-v2-desc">
              High-conviction small cap opportunities across breakthrough industries —
              tracked, analyzed, and delivered straight to your inbox.
            </p>
            <div className="sectors-hero-stats">
              <div className="sectors-hero-stat">
                <span className="sectors-hero-stat-num">14</span>
                <span className="sectors-hero-stat-label">Sectors</span>
              </div>
              <div className="sectors-hero-stat-sep" />
              <div className="sectors-hero-stat">
                <span className="sectors-hero-stat-num">50+</span>
                <span className="sectors-hero-stat-label">Stocks Tracked</span>
              </div>
              <div className="sectors-hero-stat-sep" />
              <div className="sectors-hero-stat">
                <span className="sectors-hero-stat-num" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="pulse-dot-inline" />Live
                </span>
                <span className="sectors-hero-stat-label">Price Data</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Filter Bar ── */}
      <div className="sector-filter-strip">
        <div className="sector-filter-inner">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={`sector-filter-tab ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
              {cat.key !== 'all' && (
                <span className="sector-filter-count">{cat.sectors?.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Sectors Grid ── */}
      <section className="container py-16" ref={gridRef}>
        {filteredSectors.length === 0 ? (
          <p className="text-center text-text-muted py-12">No sectors in this category.</p>
        ) : (
          <div className="sectors-grid-v2">
            {filteredSectors.map((sector, si) => {
              const Icon = sector.icon;
              const color = SECTOR_COLORS[sector.name] || 'var(--accent-primary)';

              return (
                <div
                  key={sector.name}
                  className={`sector-card-v2 ${gridVisible ? 'revealed' : ''}`}
                  style={{ '--sc': color, animationDelay: `${si * 0.06}s` }}
                >
                  {/* colored top bar — 3px */}
                  <div className="sc-accent-bar" />

                  {/* header */}
                  <div className="sc-header">
                    <div className="sc-icon">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="sc-header-text">
                      <div className="sc-name-row">
                        <h3 className="sc-name">{sector.name}</h3>
                        {TOP_PICKS.has(sector.name)
                          ? <span className="sc-badge sc-badge-top">Top Pick</span>
                          : <span className="sc-badge sc-badge-watching">Watching</span>
                        }
                      </div>
                      <p className="sc-desc">{sector.description}</p>
                    </div>
                  </div>

                  {/* stock rows */}
                  <div className="sc-stocks">
                    {sector.stocks.map((ticker, ti) => {
                      const d = stockData[ticker];
                      const change = d?.change_percent ?? null;
                      const pos = change !== null && change >= 0;

                      return (
                        <div key={ticker} className="sc-stock-row sc-stock-row-clickable" onClick={() => setSelectedTicker(ticker)}>
                          <span className="sc-stock-rank">{ti + 1}</span>
                          <span className="sc-stock-ticker">{ticker}</span>
                          <div className="sc-stock-right">
                            <span className="sc-stock-price">
                              {loading || !d ? '—' : `$${d.price.toFixed(2)}`}
                            </span>
                            {!loading && d && (
                              <div className="sc-change-wrap">
                                <span className={`sc-stock-change ${pos ? 'pos' : 'neg'}`}>
                                  {pos ? '+' : ''}{change.toFixed(2)}%
                                </span>
                                <div className="sc-bar-bg">
                                  <div
                                    className={`sc-bar-fill ${pos ? 'pos' : 'neg'}`}
                                    style={{ width: `${Math.min(Math.abs(change) * 6, 100)}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            {(loading || !d) && (
                              <span className="sc-stock-loading">loading</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* card footer */}
                  <div className="sc-card-footer">
                    <span className="sc-stock-count">{sector.stocks.length} stocks</span>
                    <Link to="/library" className="sc-view-research">
                      View research <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* hover arrow */}
                  <div className="sc-hover-arrow">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Analysis Framework ── */}
      <section className="framework-section" ref={frameworkRef}>
        <div className="container">
          <div className={`reveal-section ${frameworkVisible ? 'revealed' : ''}`}>
            <div className="section-header">
              <h2 className="display-md mb-4">Our Analysis Framework</h2>
              <p className="body-lg text-text-secondary max-w-2xl mx-auto">
                Three key pillars driving every sector and stock selection decision
              </p>
            </div>

            <div className="fw-timeline">
              {analysisFactors.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="fw-item">
                    <div className="fw-node">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="fw-card">
                      <div className="fw-step-label">STEP {f.step}</div>
                      <h3 className="fw-title">{f.title}</h3>
                      <p className="fw-desc">{f.description}</p>
                      <div className="fw-tags">
                        {f.tags.map(tag => (
                          <span key={tag} className="fw-tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="container py-20">
        <div className="sectors-cta-v2">
          <div className="sectors-cta-v2-glow" />
          <div className="sectors-cta-v2-inner">
            <div className="sectors-cta-v2-badge">
              <span className="pulse-dot-small" />
              New reports every week
            </div>
            <h2 className="sectors-cta-v2-title">Want the Full Picture?</h2>
            <p className="sectors-cta-v2-desc">
              Get deeper analysis, additional sector picks, and exclusive small cap insights
              delivered directly to your inbox — completely free.
            </p>
            <button className="btn-primary btn-large" onClick={openSubscribeModal}>
              <Mail className="w-5 h-5 mr-2" />
              Subscribe Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

    </div>

    <StockDrawer ticker={selectedTicker} onClose={() => setSelectedTicker(null)} />
  );
};

export default Sectors;
