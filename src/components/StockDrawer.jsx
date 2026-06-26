import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';

const FINNHUB_KEY = process.env.REACT_APP_FINNHUB_KEY;
const FH = 'https://finnhub.io/api/v1';

async function fhGet(path) {
  const sep = path.includes('?') ? '&' : '?';
  const res = await fetch(`${FH}${path}${sep}token=${FINNHUB_KEY}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Formatters ────────────────────────────────────────────────────────────────

function fmt(n, d = 2) {
  if (n == null || !isFinite(n)) return '—';
  return (+n).toFixed(d);
}

function fmtCap(millions) {
  if (millions == null) return '—';
  const v = millions * 1e6;
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9)  return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6)  return `$${(v / 1e6).toFixed(1)}M`;
  return `$${v.toLocaleString()}`;
}

function fmtVol(n) {
  if (n == null || !isFinite(n)) return '—';
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString();
}

function fmtDate(ts) {
  if (!ts) return '';
  return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtPct(n, d = 1) {
  if (n == null || !isFinite(n)) return '—';
  return `${(+n) >= 0 ? '+' : ''}${(+n).toFixed(d)}%`;
}

// ── No-key prompt ─────────────────────────────────────────────────────────────

function NoKeyPrompt({ ticker }) {
  return (
    <div className="sd-no-key">
      <div className="sd-no-key-icon">
        <ExternalLink className="w-6 h-6" />
      </div>
      <div className="sd-no-key-title">Connect financial data for {ticker}</div>
      <p className="sd-no-key-desc">
        Stock details use Finnhub — a free financial data API with 60 calls/min,
        no credit card needed.
      </p>
      <ol className="sd-no-key-steps">
        <li>Sign up at <a href="https://finnhub.io" target="_blank" rel="noreferrer" className="sd-link">finnhub.io</a> and copy your API key</li>
        <li>Add <code>REACT_APP_FINNHUB_KEY=your_key</code> to your <code>.env</code> file</li>
        <li>Add the same key to Vercel Environment Variables and redeploy</li>
      </ol>
    </div>
  );
}

// ── Sub-tab components ────────────────────────────────────────────────────────

function StatGrid({ items }) {
  return (
    <div className="sd-stats-grid">
      {items.map(([label, value, color]) => (
        <div key={label} className="sd-stat">
          <div className="sd-stat-label">{label}</div>
          <div className="sd-stat-value" style={color ? { color } : {}}>
            {value ?? '—'}
          </div>
        </div>
      ))}
    </div>
  );
}

function RangeBar({ low, high, current }) {
  if (!low || !high || !current || high <= low) return null;
  const pct = Math.min(100, Math.max(0, ((current - low) / (high - low)) * 100));
  return (
    <div className="sd-range-wrap">
      <div className="sd-range-ends">
        <span>${fmt(low)}</span>
        <span className="sd-range-title">52-Week Range</span>
        <span>${fmt(high)}</span>
      </div>
      <div className="sd-range-track">
        <div className="sd-range-fill" style={{ width: `${pct}%` }} />
        <div className="sd-range-thumb" style={{ left: `${pct}%` }} />
      </div>
      <div className="sd-range-pct">{pct.toFixed(0)}% from low</div>
    </div>
  );
}

function OverviewTab({ quote, profile, metrics }) {
  const m = metrics || {};
  const items = [
    ['Market Cap',        fmtCap(profile?.marketCapitalization)],
    ['Beta',              m.beta != null ? fmt(m.beta) : '—'],
    ['P/E (TTM)',         m.peBasicExclExtraTTM ? `${fmt(m.peBasicExclExtraTTM, 1)}×` : '—'],
    ['EPS (TTM)',         m.epsBasicExclExtraTTM ? `$${fmt(m.epsBasicExclExtraTTM)}` : '—'],
    ['52W High',          m['52WeekHigh'] ? `$${fmt(m['52WeekHigh'])}` : '—', 'var(--sentiment-positive)'],
    ['52W Low',           m['52WeekLow'] ? `$${fmt(m['52WeekLow'])}` : '—', 'var(--sentiment-negative)'],
    ['Day High',          `$${fmt(quote.h)}`],
    ['Day Low',           `$${fmt(quote.l)}`],
    ['Open',              `$${fmt(quote.o)}`],
    ['Prev Close',        `$${fmt(quote.pc)}`],
    ['Avg Vol (10D)',     m['10DayAverageTradingVolume'] ? fmtVol(m['10DayAverageTradingVolume'] * 1e6) : '—'],
    ['Shares Out.',       profile?.shareOutstanding ? fmtVol(profile.shareOutstanding * 1e6) : '—'],
    ['Dividend Yield',   m.dividendYieldIndicatedAnnual ? `${fmt(m.dividendYieldIndicatedAnnual)}%` : '—'],
    ['52W Return',        m['52WeekPriceReturnDaily'] ? fmtPct(m['52WeekPriceReturnDaily']) : '—'],
  ];
  return (
    <div className="sd-panel">
      <StatGrid items={items} />
      <RangeBar low={m['52WeekLow']} high={m['52WeekHigh']} current={quote.c} />
    </div>
  );
}

function MetricsTab({ metrics }) {
  const m = metrics || {};
  const rows = [
    ['Beta',                     m.beta != null ? fmt(m.beta) : '—'],
    ['P/E Ratio (TTM)',          m.peBasicExclExtraTTM ? `${fmt(m.peBasicExclExtraTTM, 1)}×` : '—'],
    ['Price / Sales (TTM)',      m.psTTM ? `${fmt(m.psTTM, 2)}×` : '—'],
    ['Price / Book (Annual)',    m.pbAnnual ? `${fmt(m.pbAnnual, 2)}×` : '—'],
    ['Price / Cash Flow (TTM)', m.pcfShareTTM ? `${fmt(m.pcfShareTTM, 2)}×` : '—'],
    ['EPS Basic (TTM)',          m.epsBasicExclExtraTTM ? `$${fmt(m.epsBasicExclExtraTTM)}` : '—'],
    ['Revenue Growth 3Y',        m.revenueGrowth3Y ? fmtPct(m.revenueGrowth3Y * 100) : '—'],
    ['Revenue Growth 5Y',        m.revenueGrowth5Y ? fmtPct(m.revenueGrowth5Y * 100) : '—'],
    ['Net Margin (Annual)',      m.netMarginAnnual ? `${fmt(m.netMarginAnnual, 1)}%` : '—'],
    ['Gross Margin (Annual)',    m.grossMarginAnnual ? `${fmt(m.grossMarginAnnual, 1)}%` : '—'],
    ['ROE (Annual)',             m.roeRfy ? `${fmt(m.roeRfy, 1)}%` : '—'],
    ['ROA (Annual)',             m.roaRfy ? `${fmt(m.roaRfy, 1)}%` : '—'],
    ['Debt / Equity',           m['totalDebt/totalEquityAnnual'] ? fmt(m['totalDebt/totalEquityAnnual'], 2) : '—'],
    ['Current Ratio',           m.currentRatioAnnual ? fmt(m.currentRatioAnnual, 2) : '—'],
    ['Dividend Yield',          m.dividendYieldIndicatedAnnual ? `${fmt(m.dividendYieldIndicatedAnnual, 2)}%` : '—'],
    ['3M Avg Volume',           m['3MonthAverageTradingVolume'] ? fmtVol(m['3MonthAverageTradingVolume'] * 1e6) : '—'],
    ['52W Price Return',        m['52WeekPriceReturnDaily'] ? fmtPct(m['52WeekPriceReturnDaily']) : '—'],
    ['YTD Price Return',        m.yearToDatePriceReturn ? fmtPct(m.yearToDatePriceReturn) : '—'],
  ];
  return (
    <div className="sd-panel">
      <div className="sd-metric-list">
        {rows.map(([label, value]) => (
          <div key={label} className="sd-metric-row">
            <span className="sd-metric-label">{label}</span>
            <span className="sd-metric-value">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutTab({ profile }) {
  if (!profile) return <div className="sd-panel"><p className="sd-empty">No company data available.</p></div>;
  const rows = [
    ['Industry',    profile.finnhubIndustry],
    ['Sector',      profile.gics_sector],
    ['Exchange',    profile.exchange],
    ['CEO',         profile.ceo],
    ['Employees',   profile.employeeTotal ? (+profile.employeeTotal).toLocaleString() : null],
    ['Founded/IPO', profile.ipo],
    ['Country',     profile.country],
    ['Currency',    profile.currency],
    ['Phone',       profile.phone],
  ].filter(([, v]) => v);
  return (
    <div className="sd-panel">
      {profile.logo && (
        <img src={profile.logo} alt={profile.name} className="sd-about-logo"
          onError={e => e.target.style.display = 'none'} />
      )}
      {profile.description && (
        <p className="sd-description">{profile.description}</p>
      )}
      <div className="sd-about-rows">
        {rows.map(([label, value]) => (
          <div key={label} className="sd-about-row">
            <span className="sd-about-label">{label}</span>
            <span className="sd-about-value">{value}</span>
          </div>
        ))}
        {profile.weburl && (
          <div className="sd-about-row">
            <span className="sd-about-label">Website</span>
            <a href={profile.weburl} target="_blank" rel="noreferrer" className="sd-link">
              {profile.weburl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              <ExternalLink className="w-3 h-3 inline ml-1" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function NewsTab({ news }) {
  if (!news.length) return <div className="sd-panel"><p className="sd-empty">No recent news found.</p></div>;
  return (
    <div className="sd-panel sd-news-panel">
      {news.map((item, i) => (
        <a key={i} href={item.url} target="_blank" rel="noreferrer" className="sd-news-item">
          {item.image && (
            <img src={item.image} alt="" className="sd-news-thumb"
              onError={e => e.target.style.display = 'none'} />
          )}
          <div className="sd-news-body">
            <div className="sd-news-meta">
              <span className="sd-news-source">{item.source}</span>
              <span className="sd-news-date">{fmtDate(item.datetime)}</span>
            </div>
            <div className="sd-news-headline">{item.headline}</div>
            {item.summary && (
              <div className="sd-news-summary">
                {item.summary.length > 130 ? item.summary.slice(0, 130) + '…' : item.summary}
              </div>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}

// ── Main drawer component ─────────────────────────────────────────────────────

const TABS = ['Overview', 'Metrics', 'About', 'News'];

const StockDrawer = ({ ticker, onClose }) => {
  const [tab, setTab] = useState('Overview');
  const [profile, setProfile] = useState(null);
  const [quote, setQuote] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cache = useRef({});

  useEffect(() => {
    if (!ticker || !FINNHUB_KEY) return;
    setTab('Overview');
    setError(null);

    if (cache.current[ticker]) {
      const c = cache.current[ticker];
      setProfile(c.profile); setQuote(c.quote);
      setMetrics(c.metrics); setNews(c.news);
      return;
    }

    setLoading(true);
    setProfile(null); setQuote(null); setMetrics(null); setNews([]);

    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - 60);
    const toStr = today.toISOString().slice(0, 10);
    const fromStr = from.toISOString().slice(0, 10);

    Promise.allSettled([
      fhGet(`/stock/profile2?symbol=${ticker}`),
      fhGet(`/quote?symbol=${ticker}`),
      fhGet(`/stock/metric?symbol=${ticker}&metric=all`),
      fhGet(`/company-news?symbol=${ticker}&from=${fromStr}&to=${toStr}`),
    ]).then(([p, q, m, n]) => {
      const prof   = p.status === 'fulfilled' ? p.value : null;
      const qt     = q.status === 'fulfilled' ? q.value : null;
      const met    = m.status === 'fulfilled' ? (m.value?.metric || {}) : {};
      const nws    = n.status === 'fulfilled' && Array.isArray(n.value) ? n.value.slice(0, 10) : [];

      if (!qt || qt.c === 0) {
        setError('No market data available for this ticker.');
      } else {
        setProfile(prof); setQuote(qt); setMetrics(met); setNews(nws);
        cache.current[ticker] = { profile: prof, quote: qt, metrics: met, news: nws };
      }
    }).catch(err => {
      setError(err.message);
    }).finally(() => setLoading(false));
  }, [ticker]);

  // Close on Escape key
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const isOpen = !!ticker;
  const changePos = quote ? quote.dp >= 0 : null;
  const changeColor = changePos === null ? 'var(--text-muted)'
    : changePos ? 'var(--sentiment-positive)' : 'var(--sentiment-negative)';

  return (
    <>
      {/* Overlay */}
      <div
        className={`sd-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`sd-drawer ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={ticker ? `${ticker} stock details` : 'Stock details'}
      >
        {/* Header bar */}
        <div className="sd-header">
          <div className="sd-header-left">
            {profile?.logo && (
              <img src={profile.logo} alt="" className="sd-logo"
                onError={e => e.target.style.display = 'none'} />
            )}
            <div>
              <div className="sd-ticker">{ticker}</div>
              {profile?.name && <div className="sd-company-name">{profile.name}</div>}
              {profile?.exchange && <div className="sd-exchange">{profile.exchange}</div>}
            </div>
          </div>
          <button className="sd-close-btn" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {!FINNHUB_KEY && <NoKeyPrompt ticker={ticker || ''} />}

        {FINNHUB_KEY && loading && (
          <div className="sd-loading">
            <div className="sd-spinner" />
            <span>Loading {ticker}…</span>
          </div>
        )}

        {FINNHUB_KEY && !loading && error && (
          <div className="sd-error-box">
            <p>{error}</p>
            <p className="sd-error-hint">
              This may be an OTC or unlisted ticker without Finnhub coverage.
            </p>
          </div>
        )}

        {FINNHUB_KEY && !loading && !error && quote && (
          <>
            {/* Price bar */}
            <div className="sd-price-bar">
              <span className="sd-current-price">${fmt(quote.c)}</span>
              <span className="sd-price-change" style={{ color: changeColor }}>
                {changePos ? '+' : ''}{fmt(quote.d)} ({changePos ? '+' : ''}{fmt(quote.dp)}%)
              </span>
              {changePos !== null && (
                changePos
                  ? <TrendingUp className="w-4 h-4" style={{ color: changeColor }} />
                  : <TrendingDown className="w-4 h-4" style={{ color: changeColor }} />
              )}
            </div>

            {/* Tabs */}
            <div className="sd-tab-bar">
              {TABS.map(t => (
                <button
                  key={t}
                  className={`sd-tab-btn ${tab === t ? 'active' : ''}`}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {tab === 'Overview'  && <OverviewTab quote={quote} profile={profile} metrics={metrics} />}
            {tab === 'Metrics'   && <MetricsTab metrics={metrics} />}
            {tab === 'About'     && <AboutTab profile={profile} />}
            {tab === 'News'      && <NewsTab news={news} />}
          </>
        )}
      </div>
    </>
  );
};

export default StockDrawer;
