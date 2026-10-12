import React from "react";
import "./Hero.css";
import WindowControls from "./WindowControls";
import { openChat, usePortfolioData } from "../context/PortfolioData";

// Shown until the profile API responds (or if it fails), so the first
// screen is never blank.
const FALLBACK = {
  name: "Hamed Afzali",
  headline: "Senior Full-Stack Engineer & Technical Lead",
  location: "Tübingen, Germany",
  languages: [
    { name: "English", level: "C1" },
    { name: "German", level: "B1" },
  ],
  summary:
    "20+ years building banking, payment, and SaaS platforms, from national payment networks to multi-tenant products.",
  pillars: [
    {
      title: "Platform architecture",
      text: "Distributed, high-availability systems for banking, payments, and multi-tenant SaaS.",
    },
    {
      title: "Technical leadership",
      text: "Delivery planning, code quality, and mentoring engineers through complex work.",
    },
    {
      title: "Modernization",
      text: "Moving legacy platforms to modern stacks in small, safe steps, like .NET Framework to .NET 8.",
    },
    {
      title: "Security & identity",
      text: "OAuth2, JWT, and fine-grained multi-tenant authorization.",
    },
  ],
};

const Hero: React.FC = () => {
  const { profile, chat } = usePortfolioData();
  const name = profile?.name || FALLBACK.name;
  const headline = profile?.headline || FALLBACK.headline;
  const summary = profile?.summary || FALLBACK.summary;
  const location = profile?.location || FALLBACK.location;
  // Only the first word of a level ("B1, working towards B2") fits here.
  const languages = (profile?.languages?.length ? profile.languages : FALLBACK.languages)
    .filter((l) => !/native/i.test(l.level))
    .map((l) => `${l.name} ${l.level.split(/[ ,]/)[0]}`);
  const pillars = profile?.pillars?.length ? profile.pillars : FALLBACK.pillars;

  return (
    <section className="hero" aria-labelledby="hero-name">
      <div className="container">
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-intro">
              <picture className="hero-avatar">
                <source srcSet="/hamed-afzali.webp" type="image/webp" />
                <img
                  src="/hamed-afzali.jpg"
                  alt=""
                  width={88}
                  height={88}
                  decoding="async"
                />
              </picture>
            </div>

            <h1 className="hero-headline" id="hero-name">
              {name}
              <span className="hero-role">{headline}</span>
            </h1>
            <p className="hero-lede">{summary}</p>
            <div className="hero-cta">
              <a href="#portfolio" className="action-btn primary">
                View selected work
              </a>
              {chat?.enabled && (
                <button type="button" className="action-btn secondary" onClick={openChat}>
                  Ask the AI about my work
                </button>
              )}
            </div>
            <ul className="hero-facts">
              <li>{location}</li>
              {languages.map((language) => (
                <li key={language}>{language}</li>
              ))}
            </ul>
          </div>

          <figure className="hero-photo">
            <div className="hero-window" aria-hidden="true">
              <WindowControls />
              <span className="hero-window-title">hamed-afzali.jpg</span>
            </div>
            <picture>
              <source srcSet="/hamed-afzali.webp" type="image/webp" />
              <img
                src="/hamed-afzali.jpg"
                alt={`${name}, ${headline}`}
                width={640}
                height={640}
              />
            </picture>
          </figure>
        </div>

        <h2 className="sr-only">What I do</h2>
        <ul className="hero-pillars">
          {pillars.map((pillar, index) => (
            <li className="hero-pillar" key={pillar.title}>
              <span className="hero-pillar-index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="hero-pillar-title">{pillar.title}</h3>
              <p className="hero-pillar-text">{pillar.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Hero;
