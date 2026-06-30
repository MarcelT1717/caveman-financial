import React, { useState, useEffect } from 'react';

const FINNHUB_KEY = process.env.REACT_APP_FINNHUB_KEY;
const FH = 'https://finnhub.io/api/v1';

async function fetchMetrics(ticker) {
  try {
    const res = await fetch(`${FH}/stock/metric?symbol=${ticker}&metric=all&token=${FINNHUB_KEY}`);
    const data = await res.json();
    return {
      ticker,
      high52: data.metric?.['52WeekHigh'] ?? null,
      low52: data.metric?.['52WeekLow'] ?? null,
    };
  } catch {
    return { ticker, high52: null, low52: null };
  }
}

function posColor(pct) {
  if (pct >= 70) return '#4ade80';
  if (pct >= 40) return '#fbbf24';
  return '#f87171';
}

export default function FiftyTwoWeekChart({ sectors, stockData, sectorColors }) {
  const [metrics, setMetrics] = useState({});
  const [loaded, setLoaded] = useState(0);
  const [done, setDone] = useState(false);

  const allTickers = sectors.flatMap(s => s.stocks);
  const total = allTickers.length;

  useEffect(() => {
    if (!FINNHUB_KEY) { setDone(true); return; }

    let cancelled = false;
    const fetchAll = async () => {
      const result = {};
      const chunkSize = 8;
      for (let i = 0; i < allTickers.length; i += chunkSize) {
        if (cancelled) return;
        const chunk = allTickers.slice(i, i + chunkSize);
        const results = await Promise.all(chunk.map(fetchMetrics));
        results.forEach(r => { result[r.ticker] = r; });
        if (!cancelled) {
          setMetrics({ ...result });
          setLoaded(Math.min(i + chunkSize, allTickers.length));
        }
        if (i + chunkSize < allTickers.length) {
          await new Promise(r => setTimeout(r, 1100));
        }
      }
      if (!cancelled) setDone(true);
    };

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  if (!FINNHUB_KEY) return null;

  const progressPct = total > 0 ? Math.round((loaded / total) * 100) : 0;

  return (
    <section className="wk52-section">
      <div className="container">
        <div className="wk52-header">
          <div className="wk52-header-text">
            <h2 className="wk52-title">52-Week Range Snapshot</h2>
            <p className="wk52-subtitle">
              Where each tracked stock sits within its annual trading range — 0% at 52-week low, 100% at high
            </p>
          </div>
          <div className="wk52-legend">
            <span className="wk52-legend-item" style={{ color: '#f87171' }}>
              <span className="wk52-legend-dot" style={{ background: '#f87171' }} />Near Low
            </span>
            <span className="wk52-legend-item" style={{ color: '#fbbf24' }}>
              <span className="wk52-legend-dot" style={{ background: '#fbbf24' }} />Mid-Range
            </span>
            <span className="wk52-legend-item" style={{ color: '#4ade80' }}>
              <span className="wk52-legend-dot" style={{ background: '#4ade80' }} />Near High
            </span>
          </div>
        </div>

        {!done && (
          <div className="wk52-loading-bar-wrap">
            <div className="wk52-loading-track">
              <div className="wk52-loading-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="wk52-loading-label">Fetching 52-week data… {loaded}/{total}</span>
          </div>
        )}

        <div className="wk52-grid">
          {sectors.map(sector => {
            const color = sectorColors[sector.name] || 'var(--accent-primary)';
            return (
              <div key={sector.name} className="wk52-card">
                <div className="wk52-card-label" style={{ color }}>
                  {sector.name}
                </div>
                {sector.stocks.map(ticker => {
                  const price = stockData[ticker]?.price ?? null;
                  const m = metrics[ticker];
                  const h52 = m?.high52;
                  const l52 = m?.low52;
                  const pct = (price != null && h52 != null && l52 != null && h52 > l52)
                    ? Math.max(0, Math.min(100, Math.round(((price - l52) / (h52 - l52)) * 100)))
                    : null;
                  const fromHigh = (price != null && h52 != null && h52 > 0)
                    ? ((price / h52 - 1) * 100)
                    : null;
                  const barColor = pct != null ? posColor(pct) : undefined;

                  return (
                    <div key={ticker} className="wk52-row">
                      <span className="wk52-ticker">{ticker}</span>

                      <div className="wk52-bar-wrap">
                        <div className="wk52-bar-track">
                          {pct != null ? (
                            <div
                              className="wk52-bar-fill"
                              style={{ width: `${pct}%`, background: barColor }}
                            />
                          ) : (
                            <div className="wk52-bar-shimmer" />
                          )}
                        </div>
                      </div>

                      <span className="wk52-pct" style={barColor ? { color: barColor } : undefined}>
                        {pct != null ? `${pct}%` : '—'}
                      </span>

                      <span className="wk52-price">
                        {price != null ? `$${price.toFixed(2)}` : '—'}
                      </span>

                      <span
                        className="wk52-from-high"
                        style={fromHigh != null && fromHigh < -30 ? { color: '#f87171' } : undefined}
                      >
                        {fromHigh != null
                          ? `${fromHigh >= 0 ? '+' : ''}${fromHigh.toFixed(1)}%`
                          : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
