// Retrieval for the chat: instead of sending every fact with every question,
// the facts are split into small chunks and only the ones that match the
// question are sent, plus a short core (who he is, a career timeline, the
// "never claim" list and how to reach him) that every answer may need.
//
// Matching is BM25 keyword scoring with light stemming and a few synonyms.
// The fact sheet is small and written in plain words, so this finds the right
// chunks without an embedding service, and it runs in well under a millisecond.

const STOP = new Set(
  `a an the and or but of to in on at for with by from about is are was were be been do does did has have had
  can could would should will what which who whom whose when where why how this that these those it its he him
  his she her they them their you your i me my we our us any some tell more please hamed afzali s`.split(/\s+/),
);

const stem = (word) =>
  word
    .replace(/'s$/, "")
    .replace(/ies$/, "y")
    .replace(/(.{4,})(ing|ed)$/, "$1")
    .replace(/(.{3,}[^s])s$/, "$1");

const tokens = (text) =>
  (text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}#+.]*/gu) || [])
    .map((w) => w.replace(/\.+$/, ""))
    .filter((w) => w && !STOP.has(w))
    .map(stem);

// Visitors and the fact sheet don't always use the same words.
const SYNONYMS = [
  ["team lead led manage manager mentor people", "team lead led engineers mentor"],
  ["contact reach email hire linkedin touch", "contact email linkedin form"],
  ["study studied degree university education school", "education degree university"],
  ["speak language languages german english persian", "languages english german persian"],
  ["certificate certified certification course courses", "certifications courses"],
  ["ai ml llm rag gpt machine agent agentic", "ai rag llm langchain mcp agentic"],
  ["cloud", "aws azure cloud"],
  ["bank banking payment payments finance fintech", "bank banking payment card atm pos"],
  ["tech stack technology technologies tools framework frameworks skill skills", "skills technologies"],
  ["security secure auth identity", "security oauth2 jwt authorization identity"],
  ["frontend ui", "react typescript frontend"],
  ["biggest largest big large scale impact proud", "concurrent users cluster branches national"],
].map(([from, to]) => [new Set(tokens(from)), tokens(to)]);

const expand = (terms) => {
  const out = [...terms];
  for (const [from, to] of SYNONYMS) if (terms.some((t) => from.has(t))) out.push(...to);
  return out;
};

/**
 * Builds the chunk index. `core` chunks always go to the model; the rest are
 * ranked per question. `overview` marks what to send for broad questions
 * ("tell me about him") that match nothing in particular.
 */
function buildIndex(chunks) {
  const docs = chunks.map((c) => ({ ...c, terms: tokens(c.text) }));
  const searchable = docs.filter((d) => !d.core);
  const df = new Map();
  for (const d of searchable) for (const t of new Set(d.terms)) df.set(t, (df.get(t) || 0) + 1);
  const avgLen = searchable.reduce((n, d) => n + d.terms.length, 0) / Math.max(1, searchable.length);
  return { docs, searchable, df, avgLen };
}

function retrieve(index, query, { limit = 5 } = {}) {
  const { docs, searchable, df, avgLen } = index;
  const terms = expand(tokens(query));
  const N = searchable.length;
  const k1 = 1.2;
  const b = 0.75;

  const scored = searchable
    .map((d) => {
      let score = 0;
      for (const t of new Set(terms)) {
        const n = df.get(t);
        if (!n) continue;
        const tf = d.terms.filter((x) => x === t).length;
        if (!tf) continue;
        const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
        score += (idf * tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * d.terms.length) / avgLen));
      }
      return { d, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score);

  // Keep the strong matches; a long tail of weak ones only adds noise.
  const top = scored[0]?.score || 0;
  let picked = scored.filter((x) => x.score >= top * 0.25).slice(0, limit).map((x) => x.d);
  if (!picked.length) picked = searchable.filter((d) => d.overview);

  return {
    chunks: [...docs.filter((d) => d.core), ...picked],
    used: picked.length,
    total: N,
  };
}

module.exports = { buildIndex, retrieve, tokens };
