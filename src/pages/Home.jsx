import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowRight, Sparkles, Mail, FileText, BarChart3, Newspaper, Bell, DollarSign, TrendingDown, ChevronDown } from 'lucide-react';
import StockCarousel from '../components/StockCarousel';
import TopSectors from '../components/TopSectors';
import MarketState from '../components/MarketState';
import { useSubscribe } from '../context/SubscribeContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Home = () => {
  const [openFaq, setOpenFaq] = React.useState(null);
  const { openSubscribeModal } = useSubscribe();
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);

  // Fetch real articles from API
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

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Open PDF in new tab
  const openArticle = (article) => {
    window.open(`${API_URL}${article.pdf_url}`, '_blank');
  };

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
      {/* Stock Ticker at Top */}
      <StockCarousel />

      {/* Hero Section - Newsletter Focus with Background Image */}
      <section className="hero-section-financial">
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content-financial">
            <div className="hero-badge mx-auto">
              <Sparkles className="w-4 h-4 mr-2" />
              The next breakthrough stock is around the corner
            </div>

            <h1 className="hero-title-financial">
              Small Cap Investment
              <span className="hero-title-highlight">Research & Insights</span>
            </h1>

            <p className="hero-description-financial">
              Expert analysis on emerging sectors and high-growth opportunities. Get weekly insights delivered to your inbox.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button 
                className="btn-primary btn-large"
                onClick={openSubscribeModal}
                data-testid="hero-subscribe-button"
              >
                <Mail className="w-5 h-5 mr-2" />
                Subscribe Now - It's Free
              </button>
              <Link to="/sectors" className="btn-secondary-outlined btn-large">
                <TrendingUp className="w-5 h-5 mr-2" />
                Explore Sectors
              </Link>
            </div>

            {/* Stats */}
            <div className="hero-stats-financial">
              <div className="hero-stat-item-financial">
                <div className="hero-stat-number-financial">100+</div>
                <div className="hero-stat-label-financial">Readers</div>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat-item-financial">
                <div className="hero-stat-number-financial">Weekly</div>
                <div className="hero-stat-label-financial">Insights</div>
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

      {/* Newsletter Benefits Section - Light Theme */}
      <section className="benefits-section-light">
        <div className="container">
          {/* Section Title - More Prominent */}
          <div className="benefits-section-header">
            <h2 className="benefits-section-title">
              Comprehensive Market Intelligence
              <span className="benefits-section-subtitle">Delivered Weekly to Your Inbox</span>
            </h2>
            <p className="benefits-section-description">
              Stay ahead of market trends with our expert analysis, research reports, and real-time alerts on breakthrough sectors and high-growth opportunities
            </p>
          </div>

          <div className="newsletter-benefits-grid-light">
            <div className="benefit-item-light">
              <div className="benefit-icon-light">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="benefit-title-light">Weekly Market Insights</h3>
              <p className="benefit-desc-light">In-depth analysis of market trends and opportunities</p>
            </div>
            <div className="benefit-item-light">
              <div className="benefit-icon-light">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="benefit-title-light">Macro & Economic Reports</h3>
              <p className="benefit-desc-light">Key economic indicators and their market impact</p>
            </div>
            <div className="benefit-item-light">
              <div className="benefit-icon-light">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="benefit-title-light">Fed Watch</h3>
              <p className="benefit-desc-light">Federal Reserve policy analysis and implications</p>
            </div>
            <div className="benefit-item-light">
              <div className="benefit-icon-light">
                <Newspaper className="w-6 h-6" />
              </div>
              <h3 className="benefit-title-light">Sector Deep Dives</h3>
              <p className="benefit-desc-light">Comprehensive sector research and analysis</p>
            </div>
            <div className="benefit-item-light">
              <div className="benefit-icon-light">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="benefit-title-light">Breaking Stock Alerts</h3>
              <p className="benefit-desc-light">Real-time alerts on significant market movements</p>
            </div>
            <div className="benefit-item-light">
              <div className="benefit-icon-light">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="benefit-title-light">Earnings Radar</h3>
              <p className="benefit-desc-light">Earnings calendar and performance tracking</p>
            </div>
          </div>

          {/* FAQ / About Us Section - Integrated */}
          <div className="faq-section-integrated">
            <div className="text-center mb-12 mt-20">
              <h2 className="h2 mb-4" style={{ color: '#1f2937' }}>A Little More About Us</h2>
              <p className="body-lg" style={{ color: '#6b7280' }}>
                Learn about our approach, philosophy, and how you can stay connected
              </p>
            </div>

            <div className="faq-container-light">
              {faqItems.map((item, index) => (
                <div key={index} className="faq-item-light">
                  <button
                    className={`faq-question-light ${openFaq === index ? 'active' : ''}`}
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="faq-question-text-light">{item.question}</span>
                    <ChevronDown 
                      className={`faq-icon-light ${openFaq === index ? 'rotate' : ''}`}
                      size={24}
                    />
                  </button>
                  <div className={`faq-answer-light ${openFaq === index ? 'open' : ''}`}>
                    <div className="faq-answer-content-light">
                      {item.answer.split('\n\n').map((paragraph, idx) => (
                        <p key={idx} className="mb-4 last:mb-0">{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Smooth Fade Transition - Light to Dark */}
      <div className="fade-transition-light-to-dark"></div>

      {/* Top 3 Sectors - Podium Style */}
      <section className="container py-24">
        <div className="section-header">
          <h2 className="display-md mb-4">Top Sectors We're Watching</h2>
          <p className="body-lg text-text-secondary max-w-2xl mx-auto">
            Focus areas with the highest potential for growth in the small cap space
          </p>
        </div>
        <TopSectors />
      </section>

      {/* Section Divider */}
      <div className="section-divider"></div>

      {/* Market State Dashboard */}
      <section className="container py-24">
        <div className="section-header">
          <h2 className="display-md mb-4">Market Overview</h2>
          <p className="body-lg text-text-secondary max-w-2xl mx-auto">
            Key economic indicators and market metrics at a glance
          </p>
        </div>
        <MarketState />
      </section>

      {/* Section Divider */}
      <div className="section-divider"></div>

      {/* Featured Articles Section */}
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
            // Loading skeleton
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
            // Empty state
            <div className="col-span-3 text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-text-muted" />
              <p className="text-text-muted">No articles yet. Check back soon!</p>
            </div>
          ) : (
            // Real articles
            articles.map((article) => (
              <div key={article.id} className="article-card" onClick={() => openArticle(article)} style={{ cursor: 'pointer' }}>
                <div className="article-image-container mb-4">
                  {article.cover_image ? (
                    <img
                      src={article.cover_image}
                      alt={article.title}
                      className="article-image"
                    />
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
                  <p className="body-md text-text-secondary mb-4 line-clamp-3">
                    {article.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                    <span className="body-sm text-text-muted">{formatDate(article.date)}</span>
                    <span className="text-accent-primary hover:text-accent-hover font-medium body-sm">
                      Read More →
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider"></div>

      {/* Secondary Newsletter CTA */}
      <section className="container py-24">
        <div className="newsletter-cta-card">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="display-sm mb-4">Don't Miss Out on Opportunities</h2>
              <p className="body-lg">
                Join 10,000+ investors getting weekly insights on breakthrough sectors and high-growth small cap stocks.
              </p>
            </div>
            <div className="flex-shrink-0">
              <button 
                className="btn-primary"
                onClick={openSubscribeModal}
                data-testid="cta-subscribe-button"
              >
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
