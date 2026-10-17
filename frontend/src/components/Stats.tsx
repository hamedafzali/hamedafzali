import React, { useCallback, useEffect, useState } from "react";
import "./Stats.css";

/**
 * Private analytics page at /stats. It isn't linked anywhere, is marked
 * noindex, and the numbers need the ADMIN_TOKEN. Everything shown is a daily
 * total; no individual visitor is recorded (see backend/analytics.js).
 */

type Pairs = [string, number][];

interface Totals {
  views: number;
  visits: number;
  avgSeconds: number;
  chatOpens: number;
  questions: number;
  contacts: number;
  cv: number;
}

interface Report {
  days: number;
  timezone: string;
  series: { day: string; views: number; visits: number }[];
  totals: Totals;
  previous: Totals;
  hours: number[];
  sources: Pairs;
  countries: Pairs;
  devices: Pairs;
  browsers: Pairs;
  os: Pairs;
  languages: Pairs;
  sections: Pairs;
  durations: Pairs;
}

const TOKEN_KEY = "stats-token";
const RANGES = [7, 30, 90, 365];

const readToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
};

const fmt = (n: number) => n.toLocaleString("en-US");
const duration = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`);
const shortDay = (day: string) =>
  new Date(`${day}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

const flag = (code: string) =>
  /^[A-Z]{2}$/.test(code)
    ? String.fromCodePoint(...code.split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
    : "";
const regionName = (() => {
  try {
    const names = new Intl.DisplayNames(["en"], { type: "region" });
    return (code: string) => (/^[A-Z]{2}$/.test(code) ? names.of(code) || code : "Unknown");
  } catch {
    return (code: string) => code;
  }
})();
const languageName = (() => {
  try {
    const names = new Intl.DisplayNames(["en"], { type: "language" });
    return (code: string) => (code === "other" ? "Other" : names.of(code) || code);
  } catch {
    return (code: string) => code;
  }
})();

const Change: React.FC<{ now: number; before: number }> = ({ now, before }) => {
  if (!before) return <span className="stats-change">no earlier data</span>;
  const pct = Math.round(((now - before) / before) * 100);
  return (
    <span className={`stats-change ${pct > 0 ? "up" : pct < 0 ? "down" : ""}`}>
      {pct === 0 ? "same as previous period" : `${pct > 0 ? "▲" : "▼"} ${Math.abs(pct)}% vs previous period`}
    </span>
  );
};

const Tile: React.FC<{ label: string; value: string; children?: React.ReactNode }> = ({
  label,
  value,
  children,
}) => (
  <div className="stats-tile">
    <span className="stats-tile-label">{label}</span>
    <strong className="stats-tile-value">{value}</strong>
    {children}
  </div>
);

/** Vertical bars with a hover readout; one series, so the title names it. */
const Columns: React.FC<{
  values: number[];
  labels: string[];
  tip: (i: number) => string;
  tickEvery: number;
}> = ({ values, labels, tip, tickEvery }) => {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...values);
  return (
    <div className="stats-columns-wrap">
      <div className="stats-readout" aria-live="polite">
        {hover !== null ? tip(hover) : "Hover a bar for details"}
      </div>
      <div className="stats-columns" onMouseLeave={() => setHover(null)}>
        {values.map((v, i) => (
          <button
            type="button"
            key={labels[i]}
            className={`stats-col ${hover === i ? "active" : ""}`}
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            aria-label={tip(i)}
          >
            <span className="stats-col-bar" style={{ height: `${(v / max) * 100}%` }} />
          </button>
        ))}
      </div>
      <div className="stats-axis">
        {labels.map((l, i) => (
          <span key={l}>{i % tickEvery === 0 ? l : ""}</span>
        ))}
      </div>
    </div>
  );
};

/** A ranked list with a bar per row: label, share bar, count. */
const Breakdown: React.FC<{
  title: string;
  rows: Pairs;
  label?: (key: string) => string;
  limit?: number;
  total?: number;
}> = ({ title, rows, label = (k) => k, limit = 8, total }) => {
  const sum = total ?? rows.reduce((n, [, v]) => n + v, 0);
  const shown = rows.slice(0, limit);
  const rest = rows.slice(limit).reduce((n, [, v]) => n + v, 0);
  if (rest) shown.push(["Other", rest]);
  return (
    <section className="stats-card">
      <h2>{title}</h2>
      {shown.length === 0 ? (
        <p className="stats-empty">No data yet</p>
      ) : (
        <ul className="stats-rows">
          {shown.map(([key, value]) => {
            const pct = sum ? Math.round((value / sum) * 100) : 0;
            return (
              <li key={key} className="stats-row">
                <span className="stats-row-bar" style={{ width: `${sum ? (value / sum) * 100 : 0}%` }} />
                <span className="stats-row-label">{key === "Other" ? "Other" : label(key)}</span>
                <span className="stats-row-value">
                  {fmt(value)} <small>{pct}%</small>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

const Stats: React.FC = () => {
  const [token, setToken] = useState(readToken);
  const [draft, setDraft] = useState("");
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Stats";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    return () => robots.remove();
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/analytics?days=${days}`, { headers: { "x-admin-token": token } });
      if (res.status === 401) {
        try {
          sessionStorage.removeItem(TOKEN_KEY);
        } catch {
          // ignore
        }
        setToken("");
        setError("That token isn't right.");
        return;
      }
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.message || `HTTP ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load the numbers.");
    } finally {
      setLoading(false);
    }
  }, [token, days]);

  useEffect(() => {
    load();
  }, [load]);

  if (!token) {
    return (
      <main className="stats stats-login">
        <form
          className="stats-card"
          onSubmit={(e) => {
            e.preventDefault();
            const t = draft.trim();
            if (!t) return;
            try {
              sessionStorage.setItem(TOKEN_KEY, t);
            } catch {
              // still works for this page view
            }
            setToken(t);
          }}
        >
          <h1>Site stats</h1>
          <label htmlFor="stats-token">Admin token</label>
          <input
            id="stats-token"
            type="password"
            autoComplete="current-password"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          {error && <p className="stats-error">{error}</p>}
          <button type="submit">Show stats</button>
        </form>
      </main>
    );
  }

  const t = data?.totals;
  const p = data?.previous;
  const series = data?.series || [];

  return (
    <main className="stats">
      <header className="stats-head">
        <div>
          <h1>Site stats</h1>
          <p className="stats-sub">
            Anonymous daily totals. No cookies, IPs or visitor IDs are stored.
            {data ? ` Times in ${data.timezone}.` : ""}
          </p>
        </div>
        <div className="stats-controls">
          <div className="stats-range" role="group" aria-label="Date range">
            {RANGES.map((r) => (
              <button
                type="button"
                key={r}
                className={r === days ? "active" : ""}
                aria-pressed={r === days}
                onClick={() => setDays(r)}
              >
                {r === 365 ? "1 year" : `${r} days`}
              </button>
            ))}
          </div>
          <button type="button" className="stats-refresh" onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </header>

      {error && <p className="stats-error">{error}</p>}

      {t && p && data && (
        <>
          <div className="stats-tiles">
            <Tile label="Visits" value={fmt(t.visits)}>
              <Change now={t.visits} before={p.visits} />
            </Tile>
            <Tile label="Page views" value={fmt(t.views)}>
              <Change now={t.views} before={p.views} />
            </Tile>
            <Tile label="Avg. time on page" value={duration(t.avgSeconds)} />
            <Tile label="Chat opened" value={fmt(t.chatOpens)}>
              <span className="stats-change">{fmt(t.questions)} questions asked</span>
            </Tile>
            <Tile label="Contact messages" value={fmt(t.contacts)} />
            <Tile label="CV downloads" value={fmt(t.cv)} />
          </div>

          <section className="stats-card">
            <h2>Visits per day</h2>
            <Columns
              values={series.map((d) => d.visits)}
              labels={series.map((d) => shortDay(d.day))}
              tip={(i) => `${shortDay(series[i].day)}: ${fmt(series[i].visits)} visits, ${fmt(series[i].views)} page views`}
              tickEvery={Math.max(1, Math.ceil(series.length / 5))}
            />
          </section>

          <div className="stats-grid">
            <Breakdown title="Where visitors came from" rows={data.sources} />
            <Breakdown title="Countries" rows={data.countries} label={(c) => `${flag(c)} ${regionName(c)}`.trim()} />
            <Breakdown title="Devices" rows={data.devices} label={(d) => d[0].toUpperCase() + d.slice(1)} />
            <Breakdown
              title="Sections reached"
              rows={data.sections}
              total={t.views}
              label={(s) => s[0].toUpperCase() + s.slice(1)}
            />
            <Breakdown title="Time on page" rows={data.durations} limit={10} />
            <Breakdown title="Browsers" rows={data.browsers} />
            <Breakdown title="Operating systems" rows={data.os} />
            <Breakdown title="Languages" rows={data.languages} label={languageName} />
          </div>

          <section className="stats-card">
            <h2>Page views by hour</h2>
            <Columns
              values={data.hours}
              labels={data.hours.map((_, h) => `${String(h).padStart(2, "0")}:00`)}
              tip={(h) => `${String(h).padStart(2, "0")}:00 to ${String(h + 1).padStart(2, "0")}:00: ${fmt(data.hours[h])} page views`}
              tickEvery={6}
            />
          </section>

          <p className="stats-foot">
            A visit is a page view that arrived from another site, a link or a typed address; reloads
            don't count again. Visitors who send Do Not Track or Global Privacy Control, and known bots,
            aren't counted. Sections reached is shown as a share of page views.
          </p>
        </>
      )}
    </main>
  );
};

export default Stats;
