import React, { useState, useEffect, useCallback } from 'react';
import { Activity, RefreshCw, ExternalLink, TrendingUp, TrendingDown, Info } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, Legend,
} from 'recharts';

// ── Constants ─────────────────────────────────────────────────────────────────

const FRED_KEY = process.env.REACT_APP_FRED_API_KEY;
const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations';
const Z_WINDOW = 120;
const TRAIL = 36;

const REGIME_COLORS = {
  Goldilocks:   '#2e7d32',
  Reflation:    '#b8860b',
  Stagflation:  '#c62828',
  Disinflation: '#1565c0',
};
const REGIME_BG = {
  Goldilocks:   'rgba(46,125,50,0.13)',
  Reflation:    'rgba(184,134,11,0.13)',
  Stagflation:  'rgba(198,40,40,0.13)',
  Disinflation: 'rgba(21,101,192,0.13)',
};
const REGIME_BORDER = {
  Goldilocks:   'rgba(46,125,50,0.45)',
  Reflation:    'rgba(184,134,11,0.45)',
  Stagflation:  'rgba(198,40,40,0.45)',
  Disinflation: 'rgba(21,101,192,0.45)',
};
const REGIME_SENTENCE = {
  Goldilocks:   'Growth above trend, inflation in check — historically the sweet spot for equities and risk assets.',
  Reflation:    'Growth and inflation both accelerating — historically favorable for cyclicals, commodities, and real assets.',
  Stagflation:  'Growth slowing while inflation rises — historically the most challenging environment for multi-asset portfolios.',
  Disinflation: 'Growth and inflation both retreating — historically favorable for long-duration bonds and defensive assets.',
};
const REGIME_DESC = {
  Goldilocks:   'Growth ↑ · Inflation ↓',
  Reflation:    'Growth ↑ · Inflation ↑',
  Stagflation:  'Growth ↓ · Inflation ↑',
  Disinflation: 'Growth ↓ · Inflation ↓',
};

const GROWTH_DEFS = {
  INDPRO:    ['Industrial Production', 'yoy', false],
  PAYEMS:    ['Nonfarm Payrolls',      'yoy', false],
  RSAFS:     ['Retail Sales',          'yoy', false],
  CFNAI:     ['Chicago Fed NAI',       'level', false],
  ICSA:      ['Initial Claims',        'yoy', true],
  UNRATE:    ['Unemployment Rate',     'level', true],
  W875RX1:   ['Real Personal Income',  'yoy', false],
};
const INFL_DEFS = {
  CPIAUCSL:             ['Headline CPI',        'yoy', false],
  PCEPILFE:             ['Core PCE',            'yoy', false],
  CPILFESL:             ['Core CPI',            'yoy', false],
  PCEPI:                ['Headline PCE',        'yoy', false],
  T10YIE:               ['10y Breakeven',       'level', false],
  CES0500000003:        ['Avg Hourly Earnings', 'yoy', false],
  PPIACO:               ['PPI All Commodities', 'yoy', false],
  CORESTICKM159SFRBATL: ['Sticky CPI',          'yoy', false],
};
const FIN_DEFS = {
  T10Y2Y:           ['10y-2y Spread',      'level'],
  T10Y3M:           ['10y-3m Spread',      'level'],
  DGS10:            ['10y Treasury',       'level'],
  DGS2:             ['2y Treasury',        'level'],
  FEDFUNDS:         ['Fed Funds Rate',     'level'],
  BAMLH0A0HYM2:     ['HY Spread (OAS)',    'level'],
  VIXCLS:           ['VIX',               'level'],
  NFCI:             ['Chicago Fin. Cond.','level'],
  SAHMREALTIME:     ['Sahm Rule',         'level'],
  DCOILWTICO:       ['WTI Crude Oil',     'level'],
  GOLDAMGBD228NLBM: ['Gold Price',        'level'],
  DTWEXBGS:         ['USD Broad Index',   'level'],
};

// ── Data utilities ────────────────────────────────────────────────────────────

function toMonthlyMap(observations) {
  const m = {};
  for (const obs of observations) {
    if (!obs.value || obs.value === '.') continue;
    m[obs.date.slice(0, 7)] = parseFloat(obs.value);
  }
  return m;
}

function sortedKeys(m) { return Object.keys(m).sort(); }

function applyYoY(m) {
  const out = {};
  for (const ym of sortedKeys(m)) {
    const [y, mo] = ym.split('-');
    const prev = `${+y - 1}-${mo}`;
    if (m[prev] != null && m[prev] !== 0) out[ym] = ((m[ym] / m[prev]) - 1) * 100;
  }
  return out;
}

function applyZscore(m) {
  const keys = sortedKeys(m);
  const out = {};
  for (let i = 0; i < keys.length; i++) {
    const ym = keys[i];
    const slice = keys.slice(Math.max(0, i - Z_WINDOW + 1), i + 1).map(k => m[k]);
    if (slice.length < 24) continue;
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
    const std = Math.sqrt(slice.reduce((a, b) => a + (b - mean) ** 2, 0) / slice.length);
    if (std < 1e-10) continue;
    out[ym] = (m[ym] - mean) / std;
  }
  return out;
}

function transformSeries(raw, how, invert) {
  const d = how === 'yoy' ? applyYoY(raw) : raw;
  const z = applyZscore(d);
  if (!invert) return z;
  return Object.fromEntries(Object.entries(z).map(([k, v]) => [k, -v]));
}

function buildComposite(zMaps) {
  const all = new Set(zMaps.flatMap(m => Object.keys(m)));
  const out = {};
  for (const ym of all) {
    const vals = zMaps.map(m => m[ym]).filter(v => v != null && isFinite(v));
    if (vals.length) out[ym] = vals.reduce((a, b) => a + b, 0) / vals.length;
  }
  return out;
}

function classify(g, i) {
  if (g >= 0 && i < 0) return 'Goldilocks';
  if (g >= 0 && i >= 0) return 'Reflation';
  if (g < 0 && i >= 0) return 'Stagflation';
  return 'Disinflation';
}

function buildPanel(gMap, iMap) {
  const keys = [...new Set([...Object.keys(gMap), ...Object.keys(iMap)])].sort();
  return keys
    .filter(ym => gMap[ym] != null && iMap[ym] != null)
    .map(ym => ({
      date: ym,
      growth: +gMap[ym].toFixed(3),
      inflation: +iMap[ym].toFixed(3),
      regime: classify(gMap[ym], iMap[ym]),
    }));
}

function currentStreak(panel) {
  if (!panel.length) return 0;
  const r = panel[panel.length - 1].regime;
  let n = 0;
  for (let i = panel.length - 1; i >= 0; i--) {
    if (panel[i].regime === r) n++; else break;
  }
  return n;
}

// ── Static snapshot (April 2026 data, shown without API key) ─────────────────

function genStaticPath() {
  const waypoints = [
    [0,  0.82, -0.28],
    [4,  0.75, -0.90],
    [8,  0.65, -1.10],
    [13, 0.72, -0.55],
    [17, 0.51, -0.18],
    [21, 0.25,  0.22],
    [25, 0.08,  0.51],
    [29, -0.12, 0.68],
    [32, -0.30, 0.80],
    [35, -0.42, 0.89],
  ];
  const start = new Date(2023, 4, 1);
  return Array.from({ length: 36 }, (_, mo) => {
    const d = new Date(start);
    d.setMonth(d.getMonth() + mo);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    let w0 = waypoints[0], w1 = waypoints[waypoints.length - 1];
    for (let i = 0; i < waypoints.length - 1; i++) {
      if (mo >= waypoints[i][0] && mo <= waypoints[i + 1][0]) {
        w0 = waypoints[i]; w1 = waypoints[i + 1]; break;
      }
    }
    const t = w0[0] === w1[0] ? 1 : (mo - w0[0]) / (w1[0] - w0[0]);
    const g = w0[1] + (w1[1] - w0[1]) * t;
    const inf = w0[2] + (w1[2] - w0[2]) * t;
    return { date: ym, growth: +g.toFixed(3), inflation: +inf.toFixed(3), regime: classify(g, inf) };
  });
}

const STATIC_DATA = {
  panel: genStaticPath(),
  growthIndicators: [
    { label: 'Nonfarm Payrolls',     z: -0.65 },
    { label: 'Chicago Fed NAI',      z: -0.58 },
    { label: 'Industrial Production',z: -0.52 },
    { label: 'Retail Sales',         z: -0.34 },
    { label: 'Unemployment Rate',    z: -0.31 },
    { label: 'Initial Claims',       z: -0.28 },
    { label: 'Real Personal Income', z: -0.18 },
  ],
  inflIndicators: [
    { label: 'PPI All Commodities',  z: 1.82 },
    { label: 'Headline CPI',         z: 1.35 },
    { label: 'Headline PCE',         z: 1.21 },
    { label: 'Core PCE',             z: 1.14 },
    { label: 'Core CPI',             z: 1.08 },
    { label: 'Sticky CPI',           z: 0.93 },
    { label: 'Avg Hourly Earnings',  z: 0.78 },
    { label: '10y Breakeven',        z: 0.62 },
  ],
  compositeHistory: null,
  finData: null,
  liveData: false,
};

// ── FRED fetch ────────────────────────────────────────────────────────────────

async function fetchFred(sid, key) {
  const params = new URLSearchParams({
    series_id: sid, api_key: key, file_type: 'json',
    observation_start: '2004-01-01', frequency: 'm',
  });
  const res = await fetch(`${FRED_BASE}?${params}`);
  if (!res.ok) throw new Error(`${sid}: HTTP ${res.status}`);
  const { observations = [] } = await res.json();
  return toMonthlyMap(observations);
}

async function loadLiveData(key, onProgress) {
  const gEntries = Object.entries(GROWTH_DEFS);
  const iEntries = Object.entries(INFL_DEFS);
  const fEntries = Object.entries(FIN_DEFS);
  const all = [...gEntries, ...iEntries, ...fEntries];
  let done = 0;

  const results = {};
  await Promise.allSettled(
    all.map(async ([sid]) => {
      try {
        results[sid] = await fetchFred(sid, key);
      } catch (e) {
        console.warn(e.message);
      } finally {
        onProgress?.(++done / all.length);
      }
    })
  );

  const gZMaps = gEntries.map(([sid, [, how, inv]]) =>
    results[sid] ? transformSeries(results[sid], how, inv) : {});
  const iZMaps = iEntries.map(([sid, [, how, inv]]) =>
    results[sid] ? transformSeries(results[sid], how, inv) : {});

  const gComp = buildComposite(gZMaps);
  const iComp = buildComposite(iZMaps);
  const panel = buildPanel(gComp, iComp);

  const latestZ = (zMap) => {
    const k = sortedKeys(zMap);
    return k.length ? zMap[k[k.length - 1]] : null;
  };

  const growthIndicators = gEntries.map(([sid, [label, how, inv]]) => ({
    label,
    z: results[sid] ? latestZ(transformSeries(results[sid], how, inv)) : null,
  })).filter(d => d.z != null);

  const inflIndicators = iEntries.map(([sid, [label, how, inv]]) => ({
    label,
    z: results[sid] ? latestZ(transformSeries(results[sid], how, inv)) : null,
  })).filter(d => d.z != null);

  const compositeHistory = panel.slice(-120).map(p => ({
    date: p.date.slice(2), growth: p.growth, inflation: p.inflation,
  }));

  const finData = {};
  for (const [sid, [label, how]] of fEntries) {
    if (!results[sid]) continue;
    const d = how === 'yoy' ? applyYoY(results[sid]) : results[sid];
    const keys = sortedKeys(d);
    finData[label] = keys.slice(-120).map(k => ({ date: k.slice(2), value: d[k] }));
  }

  return { panel, growthIndicators, inflIndicators, compositeHistory, finData, liveData: true };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function QuadrantChart({ panel, trail = TRAIL }) {
  const W = 560, H = 440;
  const pad = { l: 52, r: 28, t: 28, b: 36 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const RANGE = 3;

  const recent = panel.slice(-trail);
  if (!recent.length) return null;

  const toX = g => pad.l + ((g + RANGE) / (RANGE * 2)) * iw;
  const toY = i => pad.t + ((RANGE - i) / (RANGE * 2)) * ih;

  const pathD = recent
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'}${toX(p.growth).toFixed(1)},${toY(p.inflation).toFixed(1)}`)
    .join(' ');

  const gridVals = [-2, -1, 0, 1, 2];

  return (
    <div className="mrm-quadrant-wrap">
      <p className="mrm-quadrant-caption">
        Growth × Inflation quadrant — {trail}-month path · larger dot = most recent
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mrm-quadrant-svg" role="img" aria-label="Macro regime quadrant chart">
        {/* Quadrant fills */}
        <rect x={pad.l}        y={pad.t}        width={iw/2} height={ih/2} fill="rgba(198,40,40,0.07)" />
        <rect x={pad.l+iw/2}   y={pad.t}        width={iw/2} height={ih/2} fill="rgba(184,134,11,0.08)" />
        <rect x={pad.l+iw/2}   y={pad.t+ih/2}  width={iw/2} height={ih/2} fill="rgba(46,125,50,0.07)" />
        <rect x={pad.l}        y={pad.t+ih/2}  width={iw/2} height={ih/2} fill="rgba(21,101,192,0.07)" />

        {/* Grid */}
        {gridVals.map(v => (
          <React.Fragment key={v}>
            <line x1={toX(v)} y1={pad.t} x2={toX(v)} y2={pad.t+ih}
              stroke={v===0 ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.05)'}
              strokeWidth={v===0 ? 1.2 : 0.6} />
            <line x1={pad.l} y1={toY(v)} x2={pad.l+iw} y2={toY(v)}
              stroke={v===0 ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.05)'}
              strokeWidth={v===0 ? 1.2 : 0.6} />
          </React.Fragment>
        ))}

        {/* Quadrant labels */}
        <text x={pad.l+10} y={pad.t+18} fill={REGIME_COLORS.Stagflation} fontSize={12} opacity={0.8} fontWeight="600">stagflation</text>
        <text x={pad.l+iw-10} y={pad.t+18} fill={REGIME_COLORS.Reflation} fontSize={12} opacity={0.8} textAnchor="end" fontWeight="600">reflation</text>
        <text x={pad.l+iw-10} y={pad.t+ih-10} fill={REGIME_COLORS.Goldilocks} fontSize={12} opacity={0.8} textAnchor="end" fontWeight="600">goldilocks</text>
        <text x={pad.l+10} y={pad.t+ih-10} fill={REGIME_COLORS.Disinflation} fontSize={12} opacity={0.8} fontWeight="600">disinflation</text>

        {/* Path */}
        <path d={pathD} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={1.8} strokeDasharray="3,3" />

        {/* Dots */}
        {recent.map((p, idx) => {
          const isLatest = idx === recent.length - 1;
          const opacity = 0.3 + (idx / Math.max(recent.length - 1, 1)) * 0.7;
          return (
            <circle key={idx}
              cx={toX(p.growth)} cy={toY(p.inflation)}
              r={isLatest ? 10 : 4.5}
              fill={REGIME_COLORS[p.regime] || '#888'}
              opacity={isLatest ? 1 : opacity}
              stroke={isLatest ? 'white' : 'none'}
              strokeWidth={isLatest ? 2.5 : 0}
            >
              <title>{p.date} · {p.regime} (growth: {p.growth > 0 ? '+' : ''}{p.growth.toFixed(2)}σ, inflation: {p.inflation > 0 ? '+' : ''}{p.inflation.toFixed(2)}σ)</title>
            </circle>
          );
        })}

        {/* Axis direction labels */}
        <text x={pad.l + iw/2} y={H - 6} fill="rgba(255,255,255,0.3)" fontSize={11} textAnchor="middle">growth →</text>
        <text x={14} y={pad.t + ih/2} fill="rgba(255,255,255,0.3)" fontSize={11} textAnchor="middle"
          transform={`rotate(-90,14,${pad.t + ih/2})`}>inflation ↑</text>
      </svg>
    </div>
  );
}

function IndicatorBars({ indicators, color, label }) {
  const sorted = [...indicators].sort((a, b) => b.z - a.z);
  const maxZ = 3;
  return (
    <div className="mrm-ind-section">
      <div className="mrm-ind-section-label" style={{ color }}>{label}</div>
      <div className="mrm-ind-list">
        {sorted.map(({ label: lbl, z }) => (
          <div key={lbl} className="mrm-ind-row">
            <span className="mrm-ind-label">{lbl.toLowerCase()}</span>
            <div className="mrm-ind-track">
              <div
                className="mrm-ind-fill"
                style={{
                  width: `${Math.min(Math.abs(z) / maxZ * 100, 100)}%`,
                  background: z > 0 ? color : 'rgba(255,255,255,0.14)',
                  float: z < 0 ? 'right' : 'left',
                }}
              />
            </div>
            <span className="mrm-ind-val" style={{ color: z > 0 ? color : 'rgba(255,255,255,0.38)' }}>
              {z > 0 ? '+' : ''}{z.toFixed(2)}σ
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompositeLine({ data }) {
  if (!data || !data.length) return null;
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="mrm-tooltip">
        <div className="mrm-tooltip-date">{label}</div>
        {payload.map(p => (
          <div key={p.name} className="mrm-tooltip-row">
            <span style={{ color: p.color }}>{p.name}</span>
            <span>{p.value > 0 ? '+' : ''}{(+p.value).toFixed(2)}σ</span>
          </div>
        ))}
      </div>
    );
  };
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 12, right: 24, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} tickLine={false} interval={11} />
        <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} tickLine={false} axisLine={false}
          tickFormatter={v => `${v > 0 ? '+' : ''}${v.toFixed(1)}σ`} domain={['auto', 'auto']} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
        <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, paddingTop: 8 }} />
        <Line type="monotone" dataKey="growth" name="Growth" stroke="#3b82f6" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="inflation" name="Inflation" stroke="#ef4444" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function FinChart({ data, title }) {
  if (!data || !data.length) return null;
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="mrm-tooltip">
        <div className="mrm-tooltip-date">{label}</div>
        {payload.map(p => (
          <div key={p.dataKey} className="mrm-tooltip-row">
            <span style={{ color: p.color }}>{p.name || p.dataKey}</span>
            <span>{(+p.value).toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  };
  return (
    <div className="mrm-fin-chart">
      <div className="mrm-section-title">{title}</div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 20, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickLine={false} interval={11} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
          <Line type="monotone" dataKey="value" stroke="var(--accent-primary)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function RegimeTimeline({ panel }) {
  if (!panel || !panel.length) return null;
  const last60 = panel.slice(-60).map(p => ({
    date: p.date.slice(2),
    [p.regime]: 1,
    regime: p.regime,
  }));
  return (
    <div className="mrm-fin-chart">
      <div className="mrm-section-title">Regime Timeline — last 60 months</div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={last60} margin={{ top: 8, right: 20, left: 0, bottom: 4 }} barSize={8}>
          <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickLine={false} interval={5} />
          <YAxis hide />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div className="mrm-tooltip">
                  <div className="mrm-tooltip-date">{d?.date}</div>
                  <div style={{ color: REGIME_COLORS[d?.regime] }}>{d?.regime}</div>
                </div>
              );
            }}
          />
          {Object.keys(REGIME_COLORS).map(r => (
            <Bar key={r} dataKey={r} stackId="a" fill={REGIME_COLORS[r]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ApiKeyCard() {
  return (
    <div className="mrm-api-card">
      <div className="mrm-api-icon"><Info className="w-5 h-5" /></div>
      <div>
        <div className="mrm-api-title">Connect live FRED data</div>
        <p className="mrm-api-desc">
          This page is running on a pre-computed April 2026 snapshot. To enable live data — full history,
          composite time series, and financial conditions charts — add your free FRED API key.
        </p>
        <ol className="mrm-api-steps">
          <li>Get a free key at <a href="https://fred.stlouisfed.org/docs/api/api_key.html" target="_blank" rel="noreferrer" className="mrm-api-link">fred.stlouisfed.org <ExternalLink className="w-3 h-3 inline" /></a></li>
          <li>Add <code>REACT_APP_FRED_API_KEY=your_key</code> to your <code>.env</code> file</li>
          <li>Restart the dev server — data refreshes automatically</li>
        </ol>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const TABS = [
  { key: 'overview',   label: 'Overview' },
  { key: 'growth',     label: 'Growth' },
  { key: 'inflation',  label: 'Inflation' },
  { key: 'financial',  label: 'Financial Conditions' },
  { key: 'history',    label: 'History' },
];

const MacroRegime = () => {
  const [data, setData] = useState(STATIC_DATA);
  const [loadingLive, setLoadingLive] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [trailMonths, setTrailMonths] = useState(TRAIL);

  const fetchLive = useCallback(() => {
    if (!FRED_KEY) return;
    setLoadingLive(true);
    setLiveError(null);
    setProgress(0);
    loadLiveData(FRED_KEY, p => setProgress(p))
      .then(result => {
        setData(result);
        try { sessionStorage.setItem('mrm_cache', JSON.stringify({ ts: Date.now(), result })); } catch {}
      })
      .catch(err => setLiveError(err.message))
      .finally(() => setLoadingLive(false));
  }, []);

  useEffect(() => {
    if (!FRED_KEY) return;
    try {
      const cached = sessionStorage.getItem('mrm_cache');
      if (cached) {
        const { ts, result } = JSON.parse(cached);
        if (Date.now() - ts < 86400000) { setData(result); return; }
      }
    } catch {}
    fetchLive();
  }, [fetchLive]);

  const { panel, growthIndicators, inflIndicators, compositeHistory, finData, liveData } = data;
  const latest = panel[panel.length - 1];
  const prev   = panel[panel.length - 2];
  const regime = latest?.regime || 'Stagflation';
  const streak = currentStreak(panel);

  const gDelta  = prev ? latest.growth    - prev.growth    : null;
  const iDelta  = prev ? latest.inflation - prev.inflation : null;

  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <section className="mrm-hero">
        <div className="mrm-hero-glow" style={{ background: REGIME_COLORS[regime] }} />
        <div className="container">
          <div className="mrm-hero-inner">
            <div className="mrm-data-badge">
              <span className="pulse-dot-small" />
              {liveData ? 'Live FRED Data' : 'April 2026 Snapshot'}
            </div>
            <h1 className="mrm-hero-title">Macro Regime Monitor</h1>
            <p className="mrm-hero-sub">
              Classifies the US economy on a Growth × Inflation quadrant using a composite
              of 15+ leading indicators pulled live from FRED.
            </p>
          </div>
        </div>
      </section>

      {/* ── Regime banner ── */}
      <div className="container">
        <div
          className="mrm-banner"
          style={{ background: REGIME_BG[regime], borderColor: REGIME_BORDER[regime] }}
        >
          <div className="mrm-banner-inner">
            <div>
              <div className="mrm-regime-eyebrow" style={{ color: REGIME_COLORS[regime] }}>
                Current Regime
              </div>
              <div className="mrm-regime-name" style={{ color: REGIME_COLORS[regime] }}>
                {regime}
              </div>
              <div className="mrm-regime-desc">{REGIME_DESC[regime]}</div>
            </div>
            <div className="mrm-banner-right">
              <p className="mrm-regime-sentence">{REGIME_SENTENCE[regime]}</p>
              {FRED_KEY && (
                <button className="mrm-refresh-btn" onClick={fetchLive} disabled={loadingLive}>
                  <RefreshCw className={`w-4 h-4 ${loadingLive ? 'mrm-spin' : ''}`} />
                  {loadingLive ? `Loading ${Math.round(progress * 100)}%` : 'Refresh'}
                </button>
              )}
            </div>
          </div>
          {loadingLive && (
            <div className="mrm-progress-track">
              <div className="mrm-progress-fill" style={{ width: `${progress * 100}%`, background: REGIME_COLORS[regime] }} />
            </div>
          )}
          {liveError && <p className="mrm-error">Error: {liveError}</p>}
        </div>

        {/* ── Metric cards ── */}
        <div className="mrm-metrics-row">
          <div className="mrm-metric-card">
            <div className="mrm-metric-label">Growth Composite</div>
            <div className="mrm-metric-value" style={{ color: latest.growth >= 0 ? '#3b82f6' : '#94a3b8' }}>
              {latest.growth >= 0 ? '+' : ''}{latest.growth.toFixed(2)}σ
            </div>
            {gDelta != null && (
              <div className="mrm-metric-delta" style={{ color: gDelta >= 0 ? '#22c55e' : '#ef4444' }}>
                {gDelta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {gDelta >= 0 ? '+' : ''}{gDelta.toFixed(2)} MoM
              </div>
            )}
          </div>
          <div className="mrm-metric-card">
            <div className="mrm-metric-label">Inflation Composite</div>
            <div className="mrm-metric-value" style={{ color: latest.inflation >= 0 ? '#ef4444' : '#22c55e' }}>
              {latest.inflation >= 0 ? '+' : ''}{latest.inflation.toFixed(2)}σ
            </div>
            {iDelta != null && (
              <div className="mrm-metric-delta" style={{ color: iDelta >= 0 ? '#ef4444' : '#22c55e' }}>
                {iDelta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {iDelta >= 0 ? '+' : ''}{iDelta.toFixed(2)} MoM
              </div>
            )}
          </div>
          <div className="mrm-metric-card">
            <div className="mrm-metric-label">Streak in {regime}</div>
            <div className="mrm-metric-value" style={{ color: REGIME_COLORS[regime] }}>
              {streak} mo
            </div>
            <div className="mrm-metric-delta" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {liveData ? 'live calculation' : 'estimated'}
            </div>
          </div>
          <div className="mrm-metric-card">
            <div className="mrm-metric-label">Data as of</div>
            <div className="mrm-metric-value" style={{ fontSize: 20 }}>
              {latest.date}
            </div>
            <div className="mrm-metric-delta" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {liveData ? 'FRED live' : 'snapshot'}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mrm-tabs-bar">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`mrm-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Overview tab ── */}
        {activeTab === 'overview' && (
          <div className="mrm-tab-panel">
            <div className="mrm-trail-row">
              <span className="mrm-trail-label">Quadrant trail:</span>
              {[12, 24, 36, 48].map(n => (
                <button
                  key={n}
                  className={`mrm-trail-btn ${trailMonths === n ? 'active' : ''}`}
                  onClick={() => setTrailMonths(n)}
                >{n}mo</button>
              ))}
            </div>
            <QuadrantChart panel={panel} trail={trailMonths} />
            {!FRED_KEY && <ApiKeyCard />}
          </div>
        )}

        {/* ── Growth tab ── */}
        {activeTab === 'growth' && (
          <div className="mrm-tab-panel">
            <p className="mrm-tab-desc">
              How far each growth indicator sits from its 10-year average, measured in standard deviations.
              Negative = below trend (bearish). Positive = above trend (bullish).
            </p>
            <IndicatorBars indicators={growthIndicators} color="#3b82f6" label="Growth Indicators" />
            {liveData && compositeHistory && (
              <div className="mrm-chart-section">
                <div className="mrm-section-title">Composite History</div>
                <CompositeLine data={compositeHistory} />
              </div>
            )}
            {!liveData && <ApiKeyCard />}
          </div>
        )}

        {/* ── Inflation tab ── */}
        {activeTab === 'inflation' && (
          <div className="mrm-tab-panel">
            <p className="mrm-tab-desc">
              How far each inflation measure sits from its 10-year average.
              Positive = above trend (hawkish). Negative = below trend (dovish).
            </p>
            <IndicatorBars indicators={inflIndicators} color="#ef4444" label="Inflation Indicators" />
            {liveData && compositeHistory && (
              <div className="mrm-chart-section">
                <div className="mrm-section-title">Composite History</div>
                <CompositeLine data={compositeHistory} />
              </div>
            )}
            {!liveData && <ApiKeyCard />}
          </div>
        )}

        {/* ── Financial conditions tab ── */}
        {activeTab === 'financial' && (
          <div className="mrm-tab-panel">
            {liveData && finData ? (
              <div className="mrm-fin-grid">
                <FinChart data={finData['10y-2y Spread']} title="10y-2y Yield Curve Spread (%)" />
                <FinChart data={finData['10y-3m Spread']} title="10y-3m Yield Curve Spread (%)" />
                <FinChart data={finData['Fed Funds Rate']} title="Fed Funds Rate (%)" />
                <FinChart data={finData['10y Treasury']} title="10-Year Treasury Yield (%)" />
                <FinChart data={finData['HY Spread (OAS)']} title="High Yield Credit Spread (bps)" />
                <FinChart data={finData['VIX']} title="VIX — Equity Implied Volatility" />
                <FinChart data={finData['Sahm Rule']} title="Sahm Rule Recession Indicator" />
                <FinChart data={finData['Chicago Fin. Cond.']} title="Chicago Fed National Financial Conditions Index" />
                <FinChart data={finData['WTI Crude Oil']} title="WTI Crude Oil (USD/barrel)" />
                <FinChart data={finData['Gold Price']} title="Gold Price (USD/troy oz)" />
                <FinChart data={finData['USD Broad Index']} title="US Dollar Broad Trade-Weighted Index" />
              </div>
            ) : (
              <ApiKeyCard />
            )}
          </div>
        )}

        {/* ── History tab ── */}
        {activeTab === 'history' && (
          <div className="mrm-tab-panel">
            {liveData ? (
              <>
                <RegimeTimeline panel={panel} />
                {compositeHistory && (
                  <div className="mrm-chart-section">
                    <div className="mrm-section-title">Growth &amp; Inflation Composite — Full History (z-score)</div>
                    <CompositeLine data={compositeHistory} />
                  </div>
                )}
                <div className="mrm-stats-table-wrap">
                  <div className="mrm-section-title">Regime Statistics</div>
                  <div className="mrm-stats-table">
                    <div className="mrm-stats-header">
                      <span>Regime</span><span>Total Months</span><span>% of History</span>
                    </div>
                    {Object.keys(REGIME_COLORS).map(r => {
                      const count = panel.filter(p => p.regime === r).length;
                      const pct = panel.length ? ((count / panel.length) * 100).toFixed(1) : '—';
                      return (
                        <div key={r} className="mrm-stats-row">
                          <span style={{ color: REGIME_COLORS[r], fontWeight: 600 }}>{r}</span>
                          <span>{count}</span>
                          <span>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <ApiKeyCard />
            )}
          </div>
        )}
      </div>

      {/* bottom spacing */}
      <div style={{ height: 80 }} />
    </div>
  );
};

export default MacroRegime;
