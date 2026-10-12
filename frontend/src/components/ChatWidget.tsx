import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import "./ChatWidget.css";
import WindowControls from "./WindowControls";
import AiRobot, { RobotCue, RobotMood, useMedia } from "./AiRobot";
import ApiService, { ChatError, ChatReply, ChatTurn } from "../services/api";
import { OPEN_CHAT_EVENT, usePortfolioData } from "../context/PortfolioData";

// The robot waves once when it appears.
const WAVE: RobotCue = { gesture: "wave", key: 0 };

// Launcher robot sizes; the companion beside the open chat is larger.
const FAB_ROBOT = { desktop: 81, mobile: 57 };
const COMPANION = { desktop: 112, mobile: 66 };
const ROLL_MS = 750;
const DOZE_MS = 25000;

// What the companion does when poked.
const POKES: { mood: RobotMood; gesture: RobotCue["gesture"] }[] = [
  { mood: "excited", gesture: "jump" },
  { mood: "happy", gesture: "spin" },
  { mood: "proud", gesture: "clap" },
  { mood: "love", gesture: "bounce" },
  { mood: "shy", gesture: "wave" },
];

type Gaze = { x: number; y: number };
const AHEAD: Gaze = { x: 0, y: 0 };

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

// The small robot that pushes the latest crate along the belt.
const BeltRobot: React.FC<{ position: number; done: boolean; rejected: boolean; failed: boolean }> = ({
  position,
  done,
  rejected,
  failed,
}) => {
  const [rolling, setRolling] = useState(false);
  const [cue, setCue] = useState<RobotCue | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setRolling(true);
    const t = setTimeout(() => setRolling(false), 700);
    return () => clearTimeout(t);
  }, [position]);

  useEffect(() => {
    const gesture = failed ? "shrug" : rejected ? "shake" : done ? "clap" : null;
    if (!gesture) return;
    // Let it finish rolling to the last station first.
    const t = setTimeout(() => setCue({ gesture, key: Date.now() }), 750);
    return () => clearTimeout(t);
  }, [done, rejected, failed]);

  const mood: RobotMood = failed ? "sad" : rejected ? "confused" : done ? "happy" : "encouraging";
  return (
    <span className="belt-robot">
      <AiRobot size={42} mood={mood} cue={cue} locomotion={rolling ? "roll" : "idle"} facing="right" />
    </span>
  );
};

const Machine: React.FC<{ job: Job; latest?: boolean }> = ({ job, latest }) => {
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

      <div className={`belt${latest ? " with-robot" : ""}`} aria-hidden="true">
        <span className={`crate ${stage === 2 && !failed ? "waiting" : ""}`} style={{ left: `${(position / 3) * 100}%` }}>
          {stage >= 1 ? pressed(crate).split("|").slice(0, 3).join("|") : crate.slice(0, 10)}
          {latest && <BeltRobot position={position} done={done} rejected={rejected} failed={Boolean(failed)} />}
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

/**
 * The launcher robot, moved next to the open chat. It rolls over from where
 * the launcher was, waves, and then reacts to what happens in the chat.
 */
const Companion: React.FC<{
  from: DOMRect | null;
  size: number;
  rest: "left" | "right";
  mood: RobotMood;
  cue: RobotCue | null;
  gaze: Gaze;
  onArrive: () => void;
  onPoke: () => void;
}> = ({ from, size, rest, mood, cue, gaze, onArrive, onPoke }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [rolling, setRolling] = useState<"left" | "right" | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !from || reducedMotion() || !el.animate) {
      onArrive();
      return;
    }
    const to = el.getBoundingClientRect();
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    const scale = from.width / to.width;
    const roll = el.animate(
      [{ transform: `translate(${dx}px, ${dy}px) scale(${scale})` }, { transform: "none" }],
      { duration: ROLL_MS, easing: "cubic-bezier(0.3, 0.7, 0.3, 1)" },
    );
    setRolling(dx > 0 ? "left" : "right");
    const t = setTimeout(() => {
      setRolling(null);
      onArrive();
    }, ROLL_MS);
    return () => {
      clearTimeout(t);
      roll.cancel();
    };
    // Runs once, when the chat opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <button
      type="button"
      ref={ref}
      className="chat-companion"
      style={{ width: size, height: size }}
      aria-label="Poke the robot"
      onClick={onPoke}
    >
      <AiRobot
        size={size}
        mood={mood}
        cue={cue}
        locomotion={rolling ? "roll" : "idle"}
        facing={rolling ?? rest}
        gaze={rolling ? AHEAD : gaze}
      />
    </button>
  );
};

// Coarse pointers (phones, tablets) get an on-screen keyboard on focus.
const touch = () => typeof window !== "undefined" && Boolean(window.matchMedia?.("(pointer: coarse)").matches);

/**
 * Mobile keyboards cover fixed elements without resizing the page. Expose how
 * much of the bottom the keyboard hides and how tall the visible area is.
 */
const useKeyboardInset = (active: boolean) => {
  const [inset, setInset] = useState({ kb: 0, height: 0 });
  useEffect(() => {
    const vv = window.visualViewport;
    if (!active || !vv) return;
    const update = () =>
      setInset({ kb: Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)), height: Math.round(vv.height) });
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [active]);
  return inset;
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
  const [mood, setMood] = useState<RobotMood>("happy");
  const [flash, setFlash] = useState<RobotMood | null>(null);
  const [asleep, setAsleep] = useState(false);
  const [cue, setCue] = useState<RobotCue | null>(null);
  const nextId = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const launchFrom = useRef<DOMRect | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout>>();
  const mobile = useMedia("(max-width: 640px)");
  const keyboard = useKeyboardInset(open);
  // Android may resize the page for the keyboard instead, so a focused
  // input on a touch screen counts as the keyboard being up as well.
  const [typing, setTyping] = useState(false);

  const play = useCallback((gesture: RobotCue["gesture"]) => setCue((c) => ({ gesture, key: (c?.key ?? 0) + 1 })), []);
  // A short-lived expression on top of the robot's mood.
  const react = useCallback((expression: RobotMood, gesture?: RobotCue["gesture"], ms = 1600) => {
    clearTimeout(flashTimer.current);
    setFlash(expression);
    flashTimer.current = setTimeout(() => setFlash(null), ms);
    if (gesture) play(gesture);
  }, [play]);

  const launch = () => {
    const robot = fabRef.current?.querySelector(".ai-robot");
    launchFrom.current = robot ? robot.getBoundingClientRect() : null;
    setOpen(true);
  };

  useEffect(() => {
    if (!chat) return;
    setEnabled(chat.enabled);
    setRemaining(chat.remaining);
  }, [chat]);

  useEffect(() => {
    const onOpen = () => {
      const robot = fabRef.current?.querySelector(".ai-robot");
      launchFrom.current = robot ? robot.getBoundingClientRect() : null;
      setOpen(true);
    };
    window.addEventListener(OPEN_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    // On phones focusing opens the keyboard over the chat; let them tap.
    if (!touch()) inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, jobs]);

  // The companion dozes off when nothing happens for a while.
  useEffect(() => {
    if (!open || busy) return;
    const t = setTimeout(() => setAsleep(true), DOZE_MS);
    return () => clearTimeout(t);
  }, [open, busy, input, messages, cue]);

  useEffect(() => {
    if (!open) {
      setAsleep(false);
      setFlash(null);
    }
  }, [open]);

  useEffect(() => () => clearTimeout(flashTimer.current), []);

  const wake = () => {
    if (!asleep) return false;
    setAsleep(false);
    react("surprised", "jump", 1200);
    return true;
  };

  const poke = () => {
    if (wake()) return;
    const choice = POKES[Math.floor(Math.random() * POKES.length)];
    react(choice.mood, choice.gesture);
  };

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
    setAsleep(false);
    setFlash(null);
    setMood("thinking");
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
      if (reply.offTopic) {
        setMood("confused");
        play("shake");
      } else {
        setMood("happy");
        play("nod");
      }
    } catch (error) {
      setMood("sad");
      play("shrug");
      const message = error instanceof Error ? error.message : "Something jammed in the machine.";
      if (error instanceof ChatError && typeof error.remaining === "number") setRemaining(error.remaining);
      setJobs((all) => ({ ...all, [id]: { ...all[id], failed: message } }));
    } finally {
      setBusy(false);
      if (!touch()) inputRef.current?.focus();
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
        ref={fabRef}
        className={`chat-fab ${open ? "open" : ""}`}
        aria-label={open ? "Close the AI chat" : "Ask the AI about Hamed"}
        aria-expanded={open}
        aria-controls="chat-panel"
        onClick={() => (open ? setOpen(false) : launch())}
      >
        {open ? (
          <span className="chat-fab-close" aria-hidden="true">×</span>
        ) : (
          <AiRobot className="chat-fab-robot" size={mobile ? FAB_ROBOT.mobile : FAB_ROBOT.desktop} cue={WAVE} />
        )}
        {!open && <span className="chat-fab-badge">AI</span>}
      </button>

      {open && (
        <div
          className={`chat-dock${expanded ? " expanded" : ""}${keyboard.kb > 0 || typing ? " keyboard" : ""}`}
          style={
            keyboard.height
              ? ({ "--kb": `${keyboard.kb}px`, "--vvh": `${keyboard.height}px` } as React.CSSProperties)
              : undefined
          }
        >
          <Companion
            from={launchFrom.current}
            size={mobile ? COMPANION.mobile : COMPANION.desktop}
            rest={mobile ? "left" : "right"}
            mood={asleep ? "sleepy" : flash ?? (busy ? "thinking" : input.trim() ? "encouraging" : mood)}
            cue={cue}
            gaze={
              busy
                ? mobile ? { x: -0.3, y: 1 } : { x: 1, y: -0.2 }
                : input.trim()
                  ? mobile ? { x: -0.2, y: 1 } : { x: 1, y: 0.8 }
                  : AHEAD
            }
            onArrive={() => play("wave")}
            onPoke={poke}
          />
          <div
            id="chat-panel"
            className={`chat-panel${expanded ? " expanded" : ""}`}
            role="dialog"
            aria-label="Ask about Hamed"
            onPointerDown={wake}
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
                  {m.role === "user" && m.jobId && jobs[m.jobId] && (
                    <Machine job={jobs[m.jobId]} latest={m.jobId === nextId.current - 1} />
                  )}
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
                onChange={(e) => {
                wake();
                setInput(e.target.value);
              }}
              onFocus={() => touch() && setTyping(true)}
              onBlur={() => setTyping(false)}
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
        </div>
      )}
    </>
  );
};

export default ChatWidget;
