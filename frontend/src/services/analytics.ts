// Anonymous visit counting. Sends a few counters to /api/a and nothing that
// identifies a visitor: no cookies, no storage, no IDs, no fingerprinting.
// The server only adds them to daily totals (see backend/analytics.js).

type Payload =
  | { type: "view"; landing: boolean; ref?: string; utm?: string; lang?: string }
  | { type: "section"; name: string }
  | { type: "event"; name: "cv" | "chat_open" }
  | { type: "time"; s: number };

const ENDPOINT = "/api/a";

const send = (payload: Payload) => {
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon?.(ENDPOINT, body)) return;
  } catch {
    // fall through to fetch
  }
  fetch(ENDPOINT, { method: "POST", body, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => {});
};

export const trackEvent = (name: "cv" | "chat_open") => send({ type: "event", name });

let started = false;

/** Counts this page view, which sections get seen, and the time spent. */
export function startAnalytics() {
  if (started || window.location.pathname.startsWith("/stats")) return;
  started = true;

  // A visit is a view that came from outside the site, not a reload.
  const nav = performance.getEntriesByType?.("navigation")[0] as PerformanceNavigationTiming | undefined;
  let refHost = "";
  try {
    refHost = document.referrer ? new URL(document.referrer).hostname : "";
  } catch {
    refHost = "";
  }
  const external = refHost !== window.location.hostname;
  const params = new URLSearchParams(window.location.search);
  send({
    type: "view",
    landing: external && nav?.type !== "reload" && nav?.type !== "back_forward",
    ref: external ? refHost : "",
    utm: params.get("utm_source") || params.get("ref") || undefined,
    lang: (navigator.language || "").split("-")[0],
  });

  // Each section counts once per page view, when it reaches the middle of
  // the screen (a ratio threshold would miss sections taller than the screen).
  if ("IntersectionObserver" in window) {
    const seen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || seen.has(e.target.id)) continue;
          seen.add(e.target.id);
          observer.unobserve(e.target);
          send({ type: "section", name: e.target.id });
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    // Sections render after their data loads, so look again for a while.
    let tries = 0;
    const watch = () => {
      for (const id of ["about", "portfolio", "contact"]) {
        const el = document.getElementById(id);
        if (el && !seen.has(id)) observer.observe(el);
      }
      if (++tries < 5) setTimeout(watch, 1500);
    };
    watch();
  }

  // CV downloads, wherever the link is.
  document.addEventListener("click", (e) => {
    const link = (e.target as Element | null)?.closest?.("a[href$='.pdf']");
    if (link) trackEvent("cv");
  });

  // Time the page was actually visible, sent once when the visitor leaves.
  let visibleMs = 0;
  let since = document.visibilityState === "visible" ? Date.now() : 0;
  let sent = false;
  const flush = () => {
    if (since) visibleMs += Date.now() - since;
    since = 0;
    if (sent || visibleMs < 1000) return;
    sent = true;
    send({ type: "time", s: Math.round(visibleMs / 1000) });
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      if (!sent) since = Date.now();
    } else {
      flush();
    }
  });
  window.addEventListener("pagehide", flush);
}
