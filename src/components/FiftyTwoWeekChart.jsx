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
      low52:  data.metric?.['52WeekLow']  ?? null,
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

function highColor(fromHighPct) {
  if (fromHighPct >= -5)  return '#4ade80';
  if (fromHighPct >= -25) return '#fbbf24';
  return '#f87171';
}

function fmt(n) {
  if (n == null) return '—';
  return `$${n < 1 ? n.toFixed(4) : n.toFixed(2)}`;
}

export default function FiftyTwoWeekChart({ sectors, stockData, sectorColors, onTickerClick }) {
  const [metrics, setMetrics]   = useState({});
  const [loaded,  setLoaded]    = useState(0);
  const [done,    setDone]      = useState(false);

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
          <div>
            <h2 className="wk52-title">52-Week Range Snapshot</h2>
            <p className="wk52-subtitle">
              Where each stock sits between its annual low and high — click any row for full details
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
          <div className="wk52-loading-wrap">
            <div className="wk52-loading-track">
              <div className="wk52-loading-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="wk52-loading-label">Loading 52-week data — {loaded} / {total}</span>
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
                  const m     = metrics[ticker];
                  const h52   = m?.high52 ?? null;
                  const l52   = m?.low52  ?? null;
                  const hasRange = price != null && h52 != null && l52 != null && h52 > l52;

                  const pct = hasRange
                    ? Math.max(0, Math.min(100, Math.round(((price - l52) / (h52 - l52)) * 100)))
                    : null;

                  const fromHigh = price != null && h52 != null && h52 > 0
                    ? ((price / h52 - 1) * 100)
                    : null;

                  const barColor  = pct      != null ? posColor(pct)          : undefined;
                  const textColor = fromHigh != null ? highColor(fromHigh)    : undefined;
                  const dataReady = pct != null;

                  return (
                    <div
                      key={ticker}
                      className="wk52-row"
                      onClick={() => onTickerClick?.(ticker)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && onTickerClick?.(ticker)}
                    >
                      {/* Column 1 — ticker + current price */}
                      <div className="wk52-stock-info">
                        <span className="wk52-ticker">{ticker}</span>
                        <span className="wk52-current">{fmt(price)}</span>
                      </div>

                      {/* Column 2 — range bar */}
                      <div className="wk52-range-col">
                        <div className="wk52-range-labels">
                          <span>{l52 != null ? fmt(l52) : '—'}</span>
                          <span>{h52 != null ? fmt(h52) : '—'}</span>
                        </div>
                        <div className="wk52-bar-track">
                          {dataReady ? (
                            <>
                              <div
                                className="wk52-bar-fill"
                                style={{ width: `${pct}%`, background: barColor }}
                              />
                              <div
                                className="wk52-bar-knob"
                                style={{
                                  left: `${pct}%`,
                                  borderColor: barColor,
                                  boxShadow: `0 0 6px ${barColor}55`,
                                }}
                              />
                            </>
                          ) : (
                            <div className="wk52-bar-shimmer" />
                          )}
                        </div>
                        {dataReady && (
                          <div className="wk52-range-pct-row">
                            <span style={{ color: barColor }}>{pct}% of range</span>
                          </div>
                        )}
                      </div>

                      {/* Column 3 — % from 52wk high */}
                      <div className="wk52-high-col">
                        {fromHigh != null ? (
                          <>
                            <span className="wk52-from-val" style={{ color: textColor }}>
                              {fromHigh >= 0 ? '+' : ''}{fromHigh.toFixed(1)}%
                            </span>
                            <span className="wk52-from-label">from high</span>
                          </>
                        ) : (
                          <span className="wk52-from-val" style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </div>
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
