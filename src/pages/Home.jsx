import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowRight, Sparkles, Mail, FileText, BarChart3, Newspaper, Bell, DollarSign, ChevronDown, Zap, Calendar, Clock } from 'lucide-react';
import StockCarousel from '../components/StockCarousel';
import TopSectors from '../components/TopSectors';
import MarketState from '../components/MarketState';
import { useSubscribe } from '../context/SubscribeContext';

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

  const [servicesRef, servicesVisible] = useScrollReveal();
  const [scheduleRef, scheduleVisible] = useScrollReveal();
  const [faqRef, faqVisible] = useScrollReveal();

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
      <section className="hero-section-financial">
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content-financial">
            <div className="hero-live-badge mx-auto">
              <span className="hero-live-dot"></span>
              Constantly Updated Research
            </div>

            <h1 className="hero-title-financial">
              Small Cap Investment
              <span className="hero-title-highlight">Research & Insights</span>
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
                <div className="hero-stat-number-financial">100+</div>
                <div className="hero-stat-label-financial">Readers</div>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat-item-financial">
                <div className="hero-stat-number-financial">Weekly</div>
                <div className="hero-stat-label-financial">Reports</div>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat-item-financial">
                <div className="hero-stat-number-financial">10+</div>
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

      {/* About / FAQ Section — light background */}
      <section className="faq-light-section" ref={faqRef}>
        <div className="container">
          <div className={`reveal-section ${faqVisible ? 'revealed' : ''}`}>
            <div className="text-center mb-12">
              <h2 className="faq-light-heading">A Little More About Us</h2>
              <p className="faq-light-subheading">
                Learn about our approach, philosophy, and how you can stay connected
              </p>
            </div>
            <div className="faq-container-light">
              {faqItems.map((item, index) => (
                <div key={index} className={`faq-item-light ${openFaq === index ? 'open-item' : ''}`}>
                  <button
                    className="faq-question-light"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="faq-question-text-light">{item.question}</span>
                    <div className={`faq-icon-wrap ${openFaq === index ? 'rotate' : ''}`}>
                      <ChevronDown size={16} />
                    </div>
                  </button>
                  <div className={`faq-answer-light ${openFaq === index ? 'open' : ''}`}>
                    <div className="faq-answer-inner">
                      <div className="faq-answer-content-light">
                        {item.answer.split('\n\n').map((paragraph, idx) => (
                          <p key={idx} className="mb-4 last:mb-0">{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
