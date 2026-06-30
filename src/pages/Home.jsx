import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowRight, Sparkles, Mail, FileText, BarChart3, Newspaper, Bell, DollarSign, ChevronDown, Zap, Calendar, Clock } from 'lucide-react';
import StockCarousel from '../components/StockCarousel';
import TopSectors from '../components/TopSectors';
import MarketState from '../components/MarketState';
import { useSubscribe } from '../context/SubscribeContext';

const SECTORS = ['AI', 'Quantum', 'Robotics', 'Space', 'Energy'];

// Dense scrolling candlestick charts (two layers) + heavy floating ticker data
const HeroCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const TICKERS = [
      'NVDA','AAPL','TSLA','AMZN','META','MSFT','PLTR','SOFI',
      'MARA','RIOT','RKLB','IONQ','ACHR','JOBY','AMD','COIN',
      'SNDL','SPCE','SMCI','HIMS','RXRX','OPEN','CLOV','BBAI',
      'MULN','GFAI','ATER','NKLA','WKHS','LIDR','LAZR','ARKG',
      'HOOD','UPST','AFRM','WOLF','TTOO','CIDM','INPX','SHOT',
    ];

    // Two independent chart layers: front (dense) + back (faint, faster scroll)
    const layers = [
      { W: 6, G: 3, spd: 0.42, yTop: 0.04, yBot: 0.96, op: 0.30, lastP: 175, candles: [], off: 0, ma: true  },
      { W: 4, G: 2, spd: 0.72, yTop: 0.02, yBot: 0.52, op: 0.11, lastP: 290, candles: [], off: 0, ma: false },
    ];

    // keep old STRIDE/CANDLE_W refs alive so nothing below breaks
    const CANDLE_W = 6;
    const STRIDE   = CANDLE_W + 3;

    let labels    = [];
    let labelTick = 0;

    const mkCandle = (layer) => {
      const open  = layer.lastP;
      const d     = (Math.random() - 0.47) * 14;
      const close = open + d;
      const wick  = Math.random() * 9;
      layer.lastP = close;
      return { open, close, high: Math.max(open, close) + wick, low: Math.min(open, close) - wick };
    };

    const init = () => {
      layers.forEach(layer => {
        const stride  = layer.W + layer.G;
        layer.lastP   = layer.ma ? 175 : 290;
        layer.candles = Array.from({ length: Math.ceil(canvas.width / stride) + 70 }, () => mkCandle(layer));
        layer.off     = 0;
      });
    };

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      init();
    };
    resize();
    window.addEventListener('resize', resize);

    const spawnLabel = () => {
      const w   = canvas.width;
      const h   = canvas.height;
      const pos = Math.random() > 0.38;
      const pct = (Math.random() * 9.8 + 0.05).toFixed(2);
      const price = (30 + Math.random() * 650).toFixed(2);
      const sym = TICKERS[Math.floor(Math.random() * TICKERS.length)];
      const r   = Math.random();
      let text;
      if (r < 0.30)      text = `${sym}  ${pos ? '+' : '-'}${pct}%`;
      else if (r < 0.58) text = `${sym}  $${price}`;
      else if (r < 0.80) text = `${sym}  $${price}  ${pos ? '+' : '-'}${pct}%`;
      else               text = `$${price}  ${pos ? 'up' : 'dn'} ${pct}%`;
      labels.push({
        x: 10 + Math.random() * (w - 170),
        y: 20 + Math.random() * (h * 0.82),
        vy: -(0.05 + Math.random() * 0.16),
        alpha: 0,
        maxAlpha: 0.13 + Math.random() * 0.24,
        positive: pos,
        text,
        fs: 9 + Math.floor(Math.random() * 5),
        life: 0,
        maxLife: 130 + Math.floor(Math.random() * 130),
      });
    };

    const drawLayer = (layer, w, h) => {
      const stride = layer.W + layer.G;
      layer.off += layer.spd;
      if (layer.off >= stride) {
        layer.off -= stride;
        layer.candles.shift();
        layer.candles.push(mkCandle(layer));
      }
      const vis   = Math.ceil(w / stride) + 2;
      const slice = layer.candles.slice(-vis);
      const minP  = slice.reduce((m, c) => Math.min(m, c.low),  Infinity)  - 10;
      const maxP  = slice.reduce((m, c) => Math.max(m, c.high), -Infinity) + 10;
      const range = maxP - minP || 1;
      const top   = h * layer.yTop;
      const bot   = h * layer.yBot;
      const toY   = p => bot - ((p - minP) / range) * (bot - top);
      const si    = layer.candles.length - vis;

      layer.candles.forEach((c, i) => {
        const x  = (i - si) * stride - layer.off;
        if (x < -stride || x > w + stride) return;
        const cx   = x + layer.W / 2;
        const bull = c.close >= c.open;
        const col  = bull
          ? `rgba(34,197,94,${layer.op})`
          : `rgba(239,68,68,${layer.op * 0.92})`;
        ctx.strokeStyle = col;
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(cx, toY(c.high));
        ctx.lineTo(cx, toY(c.low));
        ctx.stroke();
        ctx.fillStyle = col;
        const by = Math.min(toY(c.open), toY(c.close));
        const bh = Math.max(Math.abs(toY(c.open) - toY(c.close)), 1.5);
        ctx.fillRect(x, by, layer.W, bh);
      });

      if (layer.ma) {
        const MA = 20;
        ctx.beginPath();
        let maOn = false;
        layer.candles.forEach((c, i) => {
          if (i < MA - 1) return;
          const avg = layer.candles.slice(i - MA + 1, i + 1).reduce((s, v) => s + v.close, 0) / MA;
          const x   = (i - si) * stride - layer.off + layer.W / 2;
          if (x < -stride || x > w + stride) return;
          if (!maOn) { ctx.moveTo(x, toY(avg)); maOn = true; }
          else ctx.lineTo(x, toY(avg));
        });
        ctx.strokeStyle = 'rgba(198,170,131,0.58)';
        ctx.lineWidth   = 1.5;
        ctx.stroke();
      }
    };

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      layers.forEach(l => drawLayer(l, w, h));

      // Spawn 2-3 labels every 12 frames, cap at 55 on screen
      labelTick++;
      if (labelTick >= 12 && labels.length < 55) {
        labelTick = 0;
        spawnLabel();
        spawnLabel();
        if (Math.random() > 0.30) spawnLabel();
      }

      const FL = 20;
      labels = labels.filter(lb => {
        lb.life++;
        lb.y += lb.vy;
        if (lb.life < FL)                   lb.alpha = lb.maxAlpha * (lb.life / FL);
        else if (lb.life > lb.maxLife - FL) lb.alpha = lb.maxAlpha * ((lb.maxLife - lb.life) / FL);
        else                                lb.alpha = lb.maxAlpha;
        ctx.globalAlpha = lb.alpha;
        ctx.font        = `bold ${lb.fs}px "SF Mono","Consolas","Courier New",monospace`;
        ctx.fillStyle   = lb.positive ? '#22c55e' : '#ef4444';
        ctx.fillText(lb.text, lb.x, lb.y);
        ctx.globalAlpha = 1;
        return lb.life < lb.maxLife;
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  );
};

// Typewriter hook — cycles through an array of words
function useTypewriter(words, typeSpeed = 80, deleteSpeed = 42, pauseMs = 2200) {
  const [wordIdx, setWordIdx] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIdx % words.length];
    let delay;
    if (!isDeleting && text.length < word.length) {
      delay = setTimeout(() => setText(word.slice(0, text.length + 1)), typeSpeed);
    } else if (!isDeleting && text.length === word.length) {
      delay = setTimeout(() => setIsDeleting(true), pauseMs);
    } else if (isDeleting && text.length > 0) {
      delay = setTimeout(() => setText(text.slice(0, -1)), deleteSpeed);
    } else {
      setIsDeleting(false);
      setWordIdx(i => (i + 1) % words.length);
    }
    return () => clearTimeout(delay);
  }, [text, isDeleting, wordIdx, words, typeSpeed, deleteSpeed, pauseMs]);

  return text;
}

// Count-up hook — starts after mountDelay ms
function useCountUp(target, duration = 1800, mountDelay = 700) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let interval;
    const timeout = setTimeout(() => {
      let current = 0;
      const steps = 60;
      const inc = target / steps;
      interval = setInterval(() => {
        current += inc;
        if (current >= target) {
          setCount(target);
          clearInterval(interval);
        } else {
          setCount(Math.round(current));
        }
      }, duration / steps);
    }, mountDelay);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, [target, duration, mountDelay]);
  return count;
}

const API_URL = process.env.REACT_APP_BACKEND_URL;

const services = [
  {
    icon: BarChart3,
    title: 'Weekly Market Insights',
    desc: 'In-depth analysis of market trends, momentum shifts, and high-conviction opportunities delivered every week.',
    freq: 'WEEKLY',
    freqKey: 'weekly',
  },
  {
    icon: Newspaper,
    title: 'Sector Deep Dives',
    desc: 'Comprehensive research reports on emerging sectors: defense tech, quantum computing, space, and more.',
    freq: 'WEEKLY',
    freqKey: 'weekly',
  },
  {
    icon: DollarSign,
    title: 'Earnings Radar',
    desc: 'Earnings calendar, analyst estimates, and post-earnings analysis for every stock in our coverage universe.',
    freq: 'WEEKLY',
    freqKey: 'weekly',
  },
  {
    icon: Bell,
    title: 'Breaking Stock Alerts',
    desc: 'Immediate notifications on significant price movements, catalyst events, and time-sensitive trading opportunities.',
    freq: 'REAL-TIME',
    freqKey: 'realtime',
  },
  {
    icon: TrendingUp,
    title: 'Fed Watch',
    desc: 'Federal Reserve policy analysis, rate decision breakdowns, and liquidity implications for growth and small cap stocks.',
    freq: 'REAL-TIME',
    freqKey: 'realtime',
  },
  {
    icon: FileText,
    title: 'Macro & Economic Reports',
    desc: 'Key economic indicators, inflation data, and a macro framework that ties directly into small cap sector rotation.',
    freq: 'MONTHLY',
    freqKey: 'monthly',
  },
];

const TABS = [
  { key: 'all', label: 'All Reports', icon: Sparkles },
  { key: 'weekly', label: 'Weekly', icon: Calendar },
  { key: 'realtime', label: 'Real-Time', icon: Zap },
  { key: 'monthly', label: 'Monthly', icon: Clock },
];

function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

const Home = () => {
  const [openFaq, setOpenFaq] = React.useState(null);
  const { openSubscribeModal } = useSubscribe();
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [prevTab, setPrevTab] = useState('all');

  const sectorText = useTypewriter(SECTORS);
  const readersCount = useCountUp(100, 1600, 600);
  const sectorsCount = useCountUp(10, 1400, 800);
  const heroRef = useRef(null);

  // Parallax: shift hero content upward slightly as user scrolls down
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onScroll = () => {
      const y = window.scrollY;
      const content = hero.querySelector('.hero-content-financial');
      if (content) content.style.transform = `translateY(${y * 0.18}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [servicesRef, servicesVisible] = useScrollReveal();
  const [scheduleRef, scheduleVisible] = useScrollReveal();
  const [faqRef, faqVisible] = useScrollReveal();

  const [aboutEmail, setAboutEmail] = useState('');
  const [aboutSubmitted, setAboutSubmitted] = useState(false);

  const handleAboutEmail = async (e) => {
    e.preventDefault();
    if (!aboutEmail.includes('@')) return;
    try {
      const res = await fetch(`${API_URL}/api/subscribe/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: aboutEmail }),
      });
      if (res.ok) setAboutSubmitted(true);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(`${API_URL}/api/articles/?limit=3`);
        if (response.ok) {
          const data = await response.json();
          setArticles(data);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setArticlesLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const openArticle = (article) => {
    window.open(`${API_URL}${article.pdf_url}`, '_blank');
  };

  const handleTabChange = (key) => {
    setPrevTab(activeTab);
    setActiveTab(key);
  };

  const filteredServices = activeTab === 'all' ? services : services.filter(s => s.freqKey === activeTab);

  const faqItems = [
    {
      question: 'Who We Are',
      answer: 'We are a research-driven finance group focused on uncovering high-growth opportunities in small-cap stocks. Our approach centers on deep sector analysis, identifying emerging industries and capitalizing on market cycles through disciplined rotation and strategic positioning. By combining rigorous fundamental research with macro and thematic awareness, we aim to position ahead of inflection points and capture asymmetric upside while managing risk with conviction and precision.'
    },
    {
      question: 'Why Small Cap?',
      answer: 'Established giants like NVIDIA and Meta Platforms are exceptional businesses—but much of their early hyper-growth is already behind them. Small caps, on the other hand, offer exposure to companies earlier in their growth cycle, where inefficiencies create the potential for outsized returns.\n\nYes, small caps carry higher risk. That\'s why our focus is on deep research, sector understanding, and disciplined selection—to identify high-conviction opportunities while actively managing downside.'
    },
    {
      question: 'Want to Stay Involved?',
      answer: 'If you\'re interested in being part of what we\'re building, we share in-depth sector research, small-cap insights, cycle analysis, and our evolving market outlook—giving you direct access to our thinking and strategy without any obligation. It\'s the simplest way to stay informed, aligned, and ahead of emerging opportunities.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Stock Ticker */}
      <StockCarousel />

      {/* Hero Section */}
      <section className="hero-section-financial" ref={heroRef}>
        <HeroCanvas />
        <div className="hero-glow-blob hero-glow-blob-1"></div>
        <div className="hero-glow-blob hero-glow-blob-2"></div>
        <div className="hero-glow-blob hero-glow-blob-3"></div>
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content-financial">
            <div className="hero-live-badge mx-auto">
              <span className="hero-live-dot"></span>
              Multi-Sector Equity Research
            </div>

            <h1 className="hero-title-financial">
              Small Cap Research
              <span className="hero-title-highlight">
                {sectorText || ' '}
                <span className="typewriter-cursor">|</span>
              </span>
            </h1>

            <p className="hero-description-financial">
              Expert analysis on emerging sectors and high-growth opportunities — delivered on a schedule you can count on.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                className="btn-primary btn-large"
                onClick={openSubscribeModal}
                data-testid="hero-subscribe-button"
              >
                <Mail className="w-5 h-5 mr-2" />
                Subscribe Free
              </button>
              <Link to="/sectors" className="btn-secondary-outlined btn-large">
                <TrendingUp className="w-5 h-5 mr-2" />
                Explore Sectors
              </Link>
            </div>

            <div className="hero-stats-financial">
              <div className="hero-stat-item-financial">
                <div className="hero-stat-number-financial">{readersCount}+</div>
                <div className="hero-stat-label-financial">Readers</div>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat-item-financial">
                <div className="hero-stat-number-financial">Weekly</div>
                <div className="hero-stat-label-financial">Reports</div>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat-item-financial">
                <div className="hero-stat-number-financial">{sectorsCount}+</div>
                <div className="hero-stat-label-financial">Sectors</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section" ref={servicesRef}>
        <div className="container">
          <div className={`section-header reveal-section ${servicesVisible ? 'revealed' : ''}`}>
            <div className="services-eyebrow">
              <Sparkles className="w-4 h-4" />
              Stay Sharp
            </div>
            <h2 className="display-md mb-4">Know More Than the Market</h2>
            <p className="body-lg text-text-secondary max-w-2xl mx-auto">
              Cut through the noise. Get the research, alerts, and sector intelligence that actually moves the needle.
            </p>
          </div>

          {/* Tab Filter */}
          <div className="services-tab-bar">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                className={`services-tab ${activeTab === key ? 'active' : ''}`}
                onClick={() => handleTabChange(key)}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Service Cards */}
          <div className="services-grid">
            {filteredServices.map((service, i) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.title}
                  className="service-card"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <span className={`freq-badge freq-${service.freqKey}`}>{service.freq}</span>
                  <div className="service-card-icon">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="service-card-title">{service.title}</h3>
                  <p className="service-card-desc">{service.desc}</p>
                  <div className="service-card-arrow">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Delivery Schedule */}
          <div className={`delivery-schedule reveal-section ${scheduleVisible ? 'revealed' : ''}`} ref={scheduleRef}>
            <div className="delivery-schedule-header">
              <h3 className="delivery-schedule-title">Always in the Loop</h3>
              <p className="delivery-schedule-subtitle">Fresh intelligence hitting your inbox on repeat</p>
            </div>
            <div className="delivery-schedule-grid">
              <div className="delivery-item delivery-realtime">
                <div className="delivery-freq-label">
                  <span className="pulse-dot-small"></span>
                  REAL-TIME
                </div>
                <ul className="delivery-list">
                  <li><Bell className="w-3.5 h-3.5" /> Breaking Stock Alerts</li>
                  <li><TrendingUp className="w-3.5 h-3.5" /> Fed Watch Updates</li>
                </ul>
              </div>
              <div className="delivery-connector">→</div>
              <div className="delivery-item delivery-weekly">
                <div className="delivery-freq-label">EVERY WEEK</div>
                <ul className="delivery-list">
                  <li><BarChart3 className="w-3.5 h-3.5" /> Market Insights Report</li>
                  <li><Newspaper className="w-3.5 h-3.5" /> Sector Deep Dives</li>
                  <li><DollarSign className="w-3.5 h-3.5" /> Earnings Radar</li>
                </ul>
              </div>
              <div className="delivery-connector">→</div>
              <div className="delivery-item delivery-monthly">
                <div className="delivery-freq-label">MONTHLY</div>
                <ul className="delivery-list">
                  <li><FileText className="w-3.5 h-3.5" /> Macro & Economic Report</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About — two-column layout */}
      <section className="faq-light-section" ref={faqRef}>
        <div className="container">
          <div className={`reveal-section ${faqVisible ? 'revealed' : ''}`}>
            <div className="text-center mb-10">
              <h2 className="faq-light-heading">A Little More About Us</h2>
              <p className="faq-light-subheading">Our approach, philosophy, and how to stay connected</p>
            </div>

            <div className="about-two-col">
              {/* Left — three info cards */}
              <div className="about-left-col">

                {/* Who We Are */}
                <div className="about-info-card">
                  <div className="about-card-icon">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="about-card-title">Who We Are</h3>
                  {faqItems[0].answer.split('\n\n').map((p, i) => (
                    <p key={i} className="about-card-text">{p}</p>
                  ))}
                </div>

                {/* Why Small Cap */}
                <div className="about-info-card">
                  <div className="about-card-icon">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h3 className="about-card-title">Why Small Cap?</h3>
                  {faqItems[1].answer.split('\n\n').map((p, i) => (
                    <p key={i} className="about-card-text">{p}</p>
                  ))}
                </div>

                {/* Stay Involved + email capture */}
                <div className="about-info-card about-stay-card">
                  <div className="about-card-icon">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="about-card-title">Stay Involved</h3>
                  {faqItems[2].answer.split('\n\n').map((p, i) => (
                    <p key={i} className="about-card-text">{p}</p>
                  ))}
                  {aboutSubmitted ? (
                    <p className="about-email-success">You're in — welcome aboard!</p>
                  ) : (
                    <form className="about-email-row" onSubmit={handleAboutEmail}>
                      <input
                        className="about-email-input"
                        type="email"
                        placeholder="your@email.com"
                        value={aboutEmail}
                        onChange={e => setAboutEmail(e.target.value)}
                      />
                      <button className="about-email-btn" type="submit">Join</button>
                    </form>
                  )}
                </div>
              </div>

              {/* Right — FAQ accordion with +/- toggles */}
              <div className="about-right-col">
                <div className="about-faq-card">
                  <div className="about-faq-header">Frequently Asked</div>
                  {faqItems.map((item, index) => (
                    <div
                      key={index}
                      className={`about-faq-item ${openFaq === index ? 'open-item' : ''}`}
                    >
                      <button
                        className="about-faq-question"
                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      >
                        <span className="about-faq-question-text">{item.question}</span>
                        <span className="about-faq-toggle">
                          {openFaq === index ? '−' : '+'}
                        </span>
                      </button>
                      <div className={`about-faq-answer ${openFaq === index ? 'open' : ''}`}>
                        <div className="about-faq-answer-inner">
                          <div className="about-faq-answer-content">
                            {item.answer.split('\n\n').map((p, idx) => (
                              <p key={idx} className="mb-3 last:mb-0">{p}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Sectors */}
      <section className="container py-24">
        <div className="section-header">
          <h2 className="display-md mb-4">Top Sectors We're Watching</h2>
          <p className="body-lg text-text-secondary max-w-2xl mx-auto">
            Focus areas with the highest potential for growth in the small cap space
          </p>
        </div>
        <TopSectors />
      </section>

      <div className="section-divider"></div>

      {/* Market Overview */}
      <section className="container py-24">
        <div className="section-header">
          <h2 className="display-md mb-4">Market Overview</h2>
          <p className="body-lg text-text-secondary max-w-2xl mx-auto">
            Key economic indicators and market metrics at a glance
          </p>
        </div>
        <MarketState />
      </section>

      <div className="section-divider"></div>

      {/* Latest Articles */}
      <section className="container py-24">
        <div className="section-header-with-cta">
          <div>
            <h2 className="display-md mb-2">Latest Insights</h2>
            <p className="body-lg text-text-secondary">
              Expert analysis and research on emerging sectors
            </p>
          </div>
          <Link to="/library" className="btn-secondary">
            View All Articles
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>

        <div className="articles-grid">
          {articlesLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="article-card animate-pulse">
                <div className="article-image-container mb-4 bg-bg-tertiary h-48"></div>
                <div className="p-6">
                  <div className="h-6 bg-bg-tertiary rounded mb-3 w-3/4"></div>
                  <div className="h-4 bg-bg-tertiary rounded mb-2"></div>
                  <div className="h-4 bg-bg-tertiary rounded w-2/3"></div>
                </div>
              </div>
            ))
          ) : articles.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-text-muted" />
              <p className="text-text-muted">No articles yet. Check back soon!</p>
            </div>
          ) : (
            articles.map((article) => (
              <div key={article.id} className="article-card" onClick={() => openArticle(article)} style={{ cursor: 'pointer' }}>
                <div className="article-image-container mb-4">
                  {article.cover_image ? (
                    <img src={article.cover_image} alt={article.title} className="article-image" />
                  ) : (
                    <div className="article-image-placeholder">
                      <FileText className="w-12 h-12 text-accent-primary" />
                      <span className="text-sm text-text-muted mt-2">PDF</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="category-badge">{article.category}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="h3 mb-3 line-clamp-2">{article.title}</h3>
                  <p className="body-md text-text-secondary mb-4 line-clamp-3">{article.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                    <span className="body-sm text-text-muted">{formatDate(article.date)}</span>
                    <span className="text-accent-primary hover:text-accent-hover font-medium body-sm">Read More →</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="section-divider"></div>

      {/* Newsletter CTA */}
      <section className="container py-24">
        <div className="newsletter-cta-card">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="display-sm mb-4">Don't Miss Out on Opportunities</h2>
              <p className="body-lg">
                Join investors getting weekly insights on breakthrough sectors and high-growth small cap stocks.
              </p>
            </div>
            <div className="flex-shrink-0">
              <button className="btn-primary" onClick={openSubscribeModal} data-testid="cta-subscribe-button">
                Subscribe to Newsletter
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
