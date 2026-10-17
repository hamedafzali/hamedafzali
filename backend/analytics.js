// Privacy-friendly visit counting for the hidden /stats page.
//
// Nothing about a visitor is stored: no cookies, no local storage, no IP
// address, no user agent string, no identifier of any kind. Each page view
// only increments counters on one document per day ("12 views from Germany,
// 8 on mobile"), so no record can be traced back to a person. The country
// comes from Cloudflare's CF-IPCountry header; the IP itself is never read
// here. Browsers that send Global Privacy Control or Do Not Track are not
// counted at all.

const express = require("express");
const mongoose = require("mongoose");

const COLLECTION = "analytics_days";
const TZ = "Europe/Berlin";
const SECTIONS = new Set(["about", "portfolio", "contact"]);
const CLIENT_EVENTS = new Set(["cv", "chat_open"]);
const DURATIONS = [
  [10, "under 10s"],
  [30, "10-30s"],
  [120, "30s-2m"],
  [300, "2-5m"],
  [Infinity, "5m+"],
];
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|monitor|curl|wget|python|axios|node-fetch/i;

const dayOf = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(date);
const hourOf = (date = new Date()) =>
  Number(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hourCycle: "h23" }).format(date));

// Mongo field names can't contain "." or start with "$".
const encode = (k) => k.replace(/%/g, "%25").replace(/\./g, "%2E").replace(/\$/g, "%24");
const decode = (k) => k.replace(/%2E/g, ".").replace(/%24/g, "$").replace(/%25/g, "%");

const device = (ua) =>
  /iPad|Tablet/i.test(ua) ? "tablet" : /Mobi|Android|iPhone/i.test(ua) ? "mobile" : "desktop";

const browser = (ua) =>
  /Edg\//.test(ua) ? "Edge"
  : /OPR\//.test(ua) ? "Opera"
  : /SamsungBrowser/.test(ua) ? "Samsung Internet"
  : /Firefox|FxiOS/.test(ua) ? "Firefox"
  : /Chrome|CriOS/.test(ua) ? "Chrome"
  : /Safari/.test(ua) ? "Safari"
  : "Other";

const os = (ua) =>
  /iPhone|iPad|iPod/.test(ua) ? "iOS"
  : /Android/.test(ua) ? "Android"
  : /Windows/.test(ua) ? "Windows"
  : /CrOS/.test(ua) ? "ChromeOS"
  : /Mac OS X|Macintosh/.test(ua) ? "macOS"
  : /Linux/.test(ua) ? "Linux"
  : "Other";

// Groups referrers by site, so "www.linkedin.com", "lnkd.in" and the
// LinkedIn app all count as LinkedIn.
const source = (ref, utm) => {
  const tag = typeof utm === "string" ? utm.toLowerCase().trim() : "";
  if (/^[\w.-]{1,40}$/.test(tag)) return tag;
  const host = typeof ref === "string" ? ref.toLowerCase().trim().replace(/^(www|m|l|lm)\./, "") : "";
  if (!host || !/^[a-z0-9.-]{1,80}$/.test(host)) return "(direct)";
  if (host.includes("linkedin") || host === "lnkd.in") return "linkedin";
  if (/(^|\.)google\.|googlequicksearchbox/.test(host)) return "google";
  if (host === "t.co" || host === "x.com" || host === "twitter.com") return "x";
  if (host.includes("bing.")) return "bing";
  if (host.includes("duckduckgo")) return "duckduckgo";
  if (host.includes("xing")) return "xing";
  return host;
};

const country = (req) => {
  const c = String(req.headers["cf-ipcountry"] || "").toUpperCase();
  return /^[A-Z]{2}$/.test(c) && c !== "XX" && c !== "T1" ? c : "unknown";
};

const optedOut = (req) => req.headers["sec-gpc"] === "1" || req.headers.dnt === "1";

const db = () => (mongoose.connection.readyState === 1 ? mongoose.connection.db : null);

/** Adds to today's counters. Losing a count when the database is down is fine. */
async function add(inc) {
  const conn = db();
  if (!conn) return;
  try {
    await conn.collection(COLLECTION).updateOne({ _id: dayOf() }, { $inc: inc }, { upsert: true });
  } catch (err) {
    console.warn("[analytics]", err.message);
  }
}

/** Server-side events: chat questions and contact messages. */
const count = (event, by = 1) => add({ [`events.${encode(event)}`]: by });

// Stops a script from inflating the numbers. The IP is only a key in memory
// for one minute and is never written anywhere.
let recent = new Map();
setInterval(() => (recent = new Map()), 60 * 1000).unref();
const flooded = (req) => {
  const ip = req.ip || "unknown";
  const n = (recent.get(ip) || 0) + 1;
  recent.set(ip, n);
  return n > 40;
};

function track(req) {
  const ua = String(req.headers["user-agent"] || "");
  let body = {};
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    return null;
  }
  if (!body || typeof body !== "object" || !ua || BOT.test(ua) || optedOut(req) || flooded(req)) return null;

  switch (body.type) {
    case "view": {
      const inc = {
        views: 1,
        [`hours.${hourOf()}`]: 1,
      };
      // A visit is a view that arrived from outside the site, so reloads
      // and in-page navigation don't count twice. No identifier is needed.
      if (body.landing) {
        const lang = typeof body.lang === "string" ? body.lang.toLowerCase().slice(0, 3) : "";
        Object.assign(inc, {
          visits: 1,
          [`sources.${encode(source(body.ref, body.utm))}`]: 1,
          [`countries.${country(req)}`]: 1,
          [`devices.${device(ua)}`]: 1,
          [`browsers.${encode(browser(ua))}`]: 1,
          [`os.${encode(os(ua))}`]: 1,
          [`languages.${/^[a-z]{2,3}$/.test(lang) ? lang : "other"}`]: 1,
        });
      }
      return inc;
    }
    case "section":
      return SECTIONS.has(body.name) ? { [`sections.${body.name}`]: 1 } : null;
    case "event":
      return CLIENT_EVENTS.has(body.name) ? { [`events.${body.name}`]: 1 } : null;
    case "time": {
      const s = Math.round(Number(body.s));
      if (!Number.isFinite(s) || s < 1 || s > 6 * 3600) return null;
      const label = DURATIONS.find(([max]) => s < max)[1];
      return { timeSum: Math.min(s, 1800), timeCount: 1, [`durations.${encode(label)}`]: 1 };
    }
    default:
      return null;
  }
}

const sorted = (map = {}) =>
  Object.entries(map)
    .map(([k, v]) => [decode(k), v])
    .sort((a, b) => b[1] - a[1]);

const merge = (docs, field) => {
  const out = {};
  for (const d of docs) for (const [k, v] of Object.entries(d[field] || {})) out[k] = (out[k] || 0) + v;
  return out;
};

const totals = (docs) => {
  const sum = (f) => docs.reduce((n, d) => n + (d[f] || 0), 0);
  const events = merge(docs, "events");
  const timeCount = sum("timeCount");
  return {
    views: sum("views"),
    visits: sum("visits"),
    avgSeconds: timeCount ? Math.round(sum("timeSum") / timeCount) : 0,
    chatOpens: events.chat_open || 0,
    questions: events.chat_question || 0,
    contacts: events.contact_sent || 0,
    cv: events.cv || 0,
  };
};

async function report(days) {
  const conn = db();
  if (!conn) throw new Error("Database not connected");
  const now = new Date();
  const dayList = Array.from({ length: days * 2 }, (_, i) => dayOf(new Date(now - i * 864e5))).reverse();
  const docs = await conn
    .collection(COLLECTION)
    .find({ _id: { $gte: dayList[0] } })
    .toArray();
  const byDay = new Map(docs.map((d) => [d._id, d]));
  const current = dayList.slice(days).map((day) => byDay.get(day)).filter(Boolean);
  const previous = dayList.slice(0, days).map((day) => byDay.get(day)).filter(Boolean);

  const hours = merge(current, "hours");
  return {
    days,
    timezone: TZ,
    series: dayList.slice(days).map((day) => ({
      day,
      views: byDay.get(day)?.views || 0,
      visits: byDay.get(day)?.visits || 0,
    })),
    totals: totals(current),
    previous: totals(previous),
    hours: Array.from({ length: 24 }, (_, h) => hours[h] || 0),
    sources: sorted(merge(current, "sources")),
    countries: sorted(merge(current, "countries")),
    devices: sorted(merge(current, "devices")),
    browsers: sorted(merge(current, "browsers")),
    os: sorted(merge(current, "os")),
    languages: sorted(merge(current, "languages")),
    sections: sorted(merge(current, "sections")),
    durations: DURATIONS.map(([, label]) => [label, merge(current, "durations")[encode(label)] || 0]),
  };
}

function registerAnalyticsRoutes(app, { requireAdmin }) {
  // sendBeacon posts text/plain, which needs no CORS preflight.
  app.post("/api/a", express.text({ type: "text/plain", limit: "2kb" }), (req, res) => {
    const inc = track(req);
    if (inc) add(inc);
    res.status(204).end();
  });

  app.get("/api/analytics", requireAdmin, async (req, res) => {
    const days = Math.min(365, Math.max(1, parseInt(req.query.days, 10) || 30));
    try {
      res.set("Cache-Control", "no-store");
      res.json(await report(days));
    } catch (error) {
      res.status(503).json({ message: error.message });
    }
  });
}

module.exports = { registerAnalyticsRoutes, count };
