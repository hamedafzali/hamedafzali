import React, { useEffect, useRef, useState } from "react";
import "./ChatWidget.css";
import WindowControls from "./WindowControls";
import ApiService, { ChatError, ChatReply, ChatTurn } from "../services/api";
import { OPEN_CHAT_EVENT, usePortfolioData } from "../context/PortfolioData";

// Each question runs through a little factory: intake, tokenizer press,
// dispatch to the AI, quality control. The stages are for fun, but the
// numbers in the log are real (keywords, size, time, tokens).

type Stage = 0 | 1 | 2 | 3 | 4; // 4 = done
type Job = {
  id: number;
  question: string;
  keywords: string[];
  stage: Stage;
  failed?: string;
  reply?: ChatReply;
};
type Message = { role: "user" | "assistant"; content: string; jobId?: number };

const STATIONS = [
  { label: "Intake", icon: "hopper" },
  { label: "Tokenizer", icon: "press" },
  { label: "AI Core", icon: "cloud" },
  { label: "QC", icon: "stamp" },
] as const;

const QUIPS: string[][] = [
  ["Unloading your question at dock 3", "Signing the delivery note", "Checking the crate for spiders"],
  ["Pressing words into tokens (gently)", "Hydraulic press at 80%", "Chopping vowels, keeping consonants"],
  [
    "Shipping by pneumatic tube",
    "The AI is reading 20 years of CV",
    "Waiting for the AI to finish its croissant",
  ],
  ["Quality control is squinting at it", "Checking for hallucinations", "Polishing the answer"],
];

// Matches the server's limit.
const MAX_QUESTION = 200;

const SUGGESTIONS = [
  "What does Hamed work on at GMG?",
  "How big was the team he led?",
  "Which technologies does he use most?",
  "How can I contact him?",
];

// Used when the model doesn't suggest follow-ups of its own.
const MORE_QUESTIONS = [
  ...SUGGESTIONS,
  "What was the biggest system he built?",
  "Does he have AI experience?",
  "Tell me about the national payment work",
  "Which languages does he speak?",
  "What is his education?",
];

const STOP = new Set(
  "a an the and or but of to in on at for with by from about is are was were be been do does did has have had can could would should will what which who whom whose when where why how this that these those it its he him his she her they them their you your i me my we our us any some tell more please hamed afzali".split(
    " ",
  ),
);

const keywordsOf = (q: string) =>
  Array.from(
    new Set(
      q
        .toLowerCase()
        .replace(/[^\p{L}\p{N}#.+\s-]/gu, " ")
        .split(/\s+/)
        .map((w) => w.replace(/^[.-]+|[.-]+$/g, ""))
        .filter((w) => w.length > 2 && !STOP.has(w)),
    ),
  ).slice(0, 5);

// "leadership" -> "lea|der|shi|p": what the press does to a word.
const pressed = (word: string) => word.match(/.{1,3}/g)?.join("|") || word;

const pick = (list: string[], seed: number) => list[seed % list.length];

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, reducedMotion() ? 0 : ms));

const Icon: React.FC<{ name: string }> = ({ name }) => {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "hopper":
      return (
        <svg {...common}>
          <path d="M3 4h18l-7 8v6l-4 2v-8z" />
        </svg>
      );
    case "press":
      return (
        <svg {...common}>
          <path d="M6 3h12M12 3v7M7 10h10v3H7zM4 20h16M8 17h8" />
        </svg>
      );
    case "cloud":
      return (
        <svg {...common}>
          <path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9.5 4.3 4.3 0 0 0 7 18z" />
          <path d="M10 13.5l1.5 1.5 3-3" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="10" r="6" />
          <path d="M9 10l2 2 4-4M8 15l-2 6 6-3 6 3-2-6" />
        </svg>
      );
  }
};

const Gear: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M10.3 2h3.4l.5 2.6 1.9.8 2.2-1.5 2.4 2.4-1.5 2.2.8 1.9 2.6.5v3.4l-2.6.5-.8 1.9 1.5 2.2-2.4 2.4-2.2-1.5-1.9.8-.5 2.6h-3.4l-.5-2.6-1.9-.8-2.2 1.5-2.4-2.4 1.5-2.2-.8-1.9L2 13.7v-3.4l2.6-.5.8-1.9-1.5-2.2 2.4-2.4 2.2 1.5 1.9-.8zM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"
    />
  </svg>
);

const ChatIcon: React.FC = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="7" width="16" height="12" rx="3" />
    <path d="M12 3v4M9 12h.01M15 12h.01M10 15.5h4M2 12v3M22 12v3" />
  </svg>
);

// **bold** spans from the model become <strong>; everything else stays text.
const inline = (text: string) =>
  text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));

// Answers are plain text; lines starting with "- " become a bullet list.
const Answer: React.FC<{ text: string }> = ({ text }) => {
  const blocks: React.ReactNode[] = [];
  let items: { text: string; depth: number }[] = [];
  const flush = () => {
    if (!items.length) return;
    blocks.push(
      <ul key={blocks.length}>
        {items.map((item, i) => (
          <li key={i} style={item.depth ? { marginLeft: item.depth * 12 } : undefined}>
            {inline(item.text)}
          </li>
        ))}
      </ul>,
    );
    items = [];
  };
  text.split("\n").forEach((line) => {
    const bullet = line.match(/^(\s*)[-*•]\s+(.*)$/);
    if (bullet) {
      items.push({ text: bullet[2], depth: Math.floor(bullet[1].length / 2) });
    } else if (line.trim()) {
      flush();
      blocks.push(<p key={blocks.length}>{inline(line.trim())}</p>);
    }
  });
  flush();
  return <div className="chat-msg assistant">{blocks}</div>;
};

const Machine: React.FC<{ job: Job }> = ({ job }) => {
  const { stage, failed, reply, keywords, question } = job;
  const done = stage === 4 && !failed;
  const rejected = done && Boolean(reply?.offTopic);
  const crate = keywords[0] || "???";
  const tokens = Math.max(1, Math.ceil(question.length / 4));
  const log: string[] = [];
  if (stage >= 0)
    log.push(
      `intake: ${question.length} chars received, keywords [${keywords.join(", ") || "none, how mysterious"}]`,
    );
  if (stage >= 1) log.push(`press: squeezed into ~${tokens} tokens (${pressed(crate)})`);
  if (stage >= 2) log.push("dispatch: crate sent to the AI core, waiting for a reply");
  if (reply)
    log.push(
      `ai core: answer back in ${(reply.ms / 1000).toFixed(1)}s, ${reply.tokens ?? "?"} tokens`,
    );
  if (rejected) log.push("qc: not about Hamed, crate rejected and sent back");
  else if (done)
    log.push(`qc: topic "${reply?.topic || "general"}", no hallucinations detected (probably)`);
  if (failed) log.push(`jam: ${failed}`);

  const position = Math.min(stage, 3);

  return (
    <div className={`machine ${failed ? "jammed" : ""} ${done ? "done" : ""} ${rejected ? "rejected" : ""}`}>
      <div className="machine-head">
        <span>job #{String(job.id).padStart(4, "0")}</span>
        <span className="machine-state">
          {failed ? "JAMMED" : rejected ? "REJECTED ✗" : done ? "SHIPPED ✓" : pick(QUIPS[stage] || QUIPS[3], job.id) + "…"}
        </span>
      </div>

      <ol className="machine-line">
        {STATIONS.map((s, i) => {
          const state = (failed && i === position) || (rejected && i === 3) ? "fault" : i < stage ? "ok" : i === stage ? "busy" : "idle";
          return (
            <li key={s.label} className={`station ${state}`}>
              <span className="station-light" />
              <span className="station-icon">
                <Icon name={s.icon} />
                {state === "busy" && <Gear className="station-gear" />}
              </span>
              <span className="station-label">{s.label}</span>
            </li>
          );
        })}
      </ol>

      <div className="belt" aria-hidden="true">
        <span className={`crate ${stage === 2 && !failed ? "waiting" : ""}`} style={{ left: `${(position / 3) * 100}%` }}>
          {stage >= 1 ? pressed(crate).split("|").slice(0, 3).join("|") : crate.slice(0, 10)}
        </span>
      </div>

      <ul className="machine-log">
        {log.map((line) => (
          <li key={line}>
            <span aria-hidden="true">&gt;</span> {line}
          </li>
        ))}
      </ul>
    </div>
  );
};

const ChatWidget: React.FC = () => {
  const { chat } = usePortfolioData();
  const [enabled, setEnabled] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [jobs, setJobs] = useState<Record<number, Job>>({});
  const nextId = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!chat) return;
    setEnabled(chat.enabled);
    setRemaining(chat.remaining);
  }, [chat]);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, jobs]);

  if (!enabled) return null;

  // After an answer (or a jam), offer the model's follow-ups, topped up from
  // our own list with questions not asked yet.
  const asked = new Set(messages.filter((m) => m.role === "user").map((m) => m.content));
  const lastJob = messages.length ? jobs[messages[messages.length - 1].jobId ?? -1] : undefined;
  const followups = lastJob
    ? Array.from(new Set([...(lastJob.reply?.followups || []), ...MORE_QUESTIONS]))
        .filter((q) => !asked.has(q))
        .slice(0, 3)
    : [];

  const update = (id: number, patch: Partial<Job>) =>
    setJobs((all) => ({ ...all, [id]: { ...all[id], ...patch } }));

  const ask = async (raw: string) => {
    const question = raw.trim().slice(0, MAX_QUESTION);
    if (!question || busy || remaining <= 0) return;
    const id = nextId.current++;
    const history: ChatTurn[] = messages
      .slice(-6)
      .map(({ role, content }) => ({ role, content }));

    setInput("");
    setBusy(true);
    setJobs((all) => ({ ...all, [id]: { id, question, keywords: keywordsOf(question), stage: 0 } }));
    setMessages((all) => [...all, { role: "user", content: question, jobId: id }]);

    const request = ApiService.askChat(question, history);
    // Awaited after the first stages; this stops an early failure from
    // being reported as unhandled in the meantime.
    request.catch(() => {});
    try {
      await wait(900);
      update(id, { stage: 1 });
      await wait(1000);
      update(id, { stage: 2 });
      const [reply] = await Promise.all([request, wait(900)]);
      update(id, { stage: 3, reply });
      if (typeof reply.remaining === "number") setRemaining(reply.remaining);
      await wait(900);
      update(id, { stage: 4 });
      setMessages((all) => [...all, { role: "assistant", content: reply.answer, jobId: id }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something jammed in the machine.";
      if (error instanceof ChatError && typeof error.remaining === "number") setRemaining(error.remaining);
      setJobs((all) => ({ ...all, [id]: { ...all[id], failed: message } }));
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  return (
    <>
      <button
        type="button"
        className={`chat-fab ${open ? "open" : ""}`}
        aria-label={open ? "Close the AI chat" : "Ask the AI about Hamed"}
        aria-expanded={open}
        aria-controls="chat-panel"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <span className="chat-fab-close" aria-hidden="true">×</span> : <ChatIcon />}
        {!open && <span className="chat-fab-badge">AI</span>}
      </button>

      {open && (
        <div
          id="chat-panel"
          className={`chat-panel${expanded ? " expanded" : ""}`}
          role="dialog"
          aria-label="Ask about Hamed"
        >
          <div className="chat-bar">
            <WindowControls
              onClose={() => setOpen(false)}
              onMinimize={() => setOpen(false)}
              onZoom={() => setExpanded((v) => !v)}
              zoomed={expanded}
            />
            <span className="chat-title">ask-hamed.ai</span>
          </div>

          <div className="chat-body" ref={listRef} aria-live="polite">
            <p className="chat-msg assistant">
              Hi! I'm a small AI factory that knows Hamed's CV. Drop a question in the hopper and
              watch it get processed.
            </p>
            {messages.length === 0 && remaining > 0 && (
              <div className="chat-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => ask(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <React.Fragment key={i}>
                {m.role === "assistant" ? (
                  <Answer text={m.content} />
                ) : (
                  <p className="chat-msg user">{m.content}</p>
                )}
                {m.role === "user" && m.jobId && jobs[m.jobId] && <Machine job={jobs[m.jobId]} />}
              </React.Fragment>
            ))}
            {!busy && remaining > 0 && followups.length > 0 && (
              <div className="chat-suggestions" aria-label="Suggested questions">
                <span className="chat-suggestions-label">Ask next:</span>
                {followups.map((q) => (
                  <button key={q} type="button" onClick={() => ask(q)}>
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form className="chat-input" onSubmit={onSubmit}>
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              maxLength={MAX_QUESTION}
              disabled={remaining <= 0}
              placeholder={
                remaining <= 0
                  ? "No questions left today"
                  : busy
                    ? "The machine is working…"
                    : "Ask about Hamed's work"
              }
              aria-label="Your question"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(input);
                }
              }}
            />
            <button type="submit" className="chat-send" disabled={busy || remaining <= 0 || !input.trim()} aria-label="Send">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </form>
          <p className="chat-note">
            {remaining > 0
              ? `${remaining} question${remaining === 1 ? "" : "s"} left today.`
              : "No questions left today. The contact form is always open."}
          </p>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
