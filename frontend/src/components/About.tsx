import React, { useState, useEffect, useMemo } from "react";
import "./About.css";
import ApiService, { Skill } from "../services/api";
import { usePortfolioData } from "../context/PortfolioData";

const CATEGORY_LABELS: Record<string, string> = {
  architecture: "Architecture",
  backend: "Backend & Platforms",
  leadership: "Leadership",
  security: "Security",
  ai: "AI-Assisted Engineering",
  cloud: "Cloud & DevOps",
  database: "Data & Databases",
  integration: "Systems Integration",
  frontend: "Frontend",
  quality: "Quality Engineering",
  general: "Core Skills",
};
// Display order of skill groups: architecture and leadership first.
const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS);

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Types the code out character by character. The full text is rendered
// invisibly underneath, so the editor has its final height from the start.
const useTypedText = (full: string, speed = 18) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!full) return;
    if (prefersReducedMotion()) {
      setCount(full.length);
      return;
    }
    setCount(0);
    const timer = setInterval(() => {
      setCount((c) => {
        if (c >= full.length) {
          clearInterval(timer);
          return c;
        }
        return c + 1;
      });
    }, speed);
    return () => clearInterval(timer);
  }, [full, speed]);
  return full.slice(0, count);
};

const About: React.FC = () => {
  const { profile, skills } = usePortfolioData();
  const [codeLines, setCodeLines] = useState<string[]>([]);

  useEffect(() => {
    ApiService.getCodeDisplay()
      .then(setCodeLines)
      .catch(() => setCodeLines([]));
  }, []);

  const fullCode = codeLines.join("\n");
  const typedCode = useTypedText(fullCode);

  const skillGroups = useMemo(() => {
    const groups = new Map<string, Skill[]>();
    skills.forEach((skill) => {
      const key = skill.category || "general";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(skill);
    });
    const rank = (c: string) =>
      CATEGORY_ORDER.includes(c) ? CATEGORY_ORDER.indexOf(c) : CATEGORY_ORDER.length;
    return Array.from(groups.entries())
      .map(([category, items]) => ({
        category,
        label: CATEGORY_LABELS[category] || category,
        items: [...items].sort((a, b) => b.level - a.level),
      }))
      .sort((a, b) => rank(a.category) - rank(b.category));
  }, [skills]);

  const highlights = profile?.careerHighlights || [];
  // Older data may not have the about paragraphs yet: fall back to the summary.
  const paragraphs = profile?.about?.length ? profile.about : profile?.summary ? [profile.summary] : [];
  const timeline = profile?.timeline || [];

  return (
    <section id="about" className="about">
      <div className="container">
        <header className="section-head">
          <h2 className="section-title">
            <span className="code-bracket">{"<"}</span>
            <span className="code-tag">about</span>
            <span className="code-bracket">{"/>"}</span>
          </h2>
          <p className="section-subtitle">
            Architecture, delivery, and the teams that make both work.
          </p>
        </header>

        <div className="about-intro">
          <div className="about-narrative">
            {paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}

            {timeline.length > 0 && (
              <ol className="about-timeline" aria-label="Career path">
                {timeline.map((step) => (
                  <li key={step.period}>
                    <span className="about-timeline-period">{step.period}</span>
                    <span className="about-timeline-role">{step.role}</span>
                    <span className="about-timeline-org">{step.org}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {fullCode && (
            <div className="about-editor" aria-hidden="true">
              <div className="about-editor-bar">
                <span className="about-editor-dot" />
                <span className="about-editor-dot" />
                <span className="about-editor-dot" />
                <span className="about-editor-title">developer.ts</span>
              </div>
              <pre className="about-editor-code">
                <code className="about-editor-ghost">{fullCode}</code>
                <code className="about-editor-typed">
                  {typedCode}
                  <span className="about-editor-cursor" />
                </code>
              </pre>
            </div>
          )}
        </div>

        {highlights.length > 0 && (
          <div className="about-block">
            <h3 className="about-block-title">Career highlights</h3>
            <ol className="highlights-grid">
              {highlights.map((highlight, index) => (
                <li className="highlight-card" key={highlight.title}>
                  <span className="highlight-index" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h4>{highlight.title}</h4>
                  <p>{highlight.description}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {skillGroups.length > 0 && (
          <div className="about-block">
            <h3 className="about-block-title">Expertise</h3>
            <dl className="expertise-panel">
              {skillGroups.map((group) => (
                <div className="expertise-row" key={group.category}>
                  <dt className="expertise-label">{group.label}</dt>
                  <dd>
                    <ul>
                      {group.items.map((skill) => (
                        <li key={skill.name} title={skill.description || undefined}>
                          {skill.name}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </section>
  );
};

export default About;
