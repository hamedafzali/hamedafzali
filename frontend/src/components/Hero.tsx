import React from "react";
import "./Hero.css";
import { usePortfolioData } from "../context/PortfolioData";

// Shown until the profile API responds (or if it fails), so the first
// screen is never blank.
const FALLBACK = {
  name: "Hamed Afzali",
  headline: "Senior Full-Stack Engineer & Technical Lead",
  summary:
    "20+ years designing and leading delivery of mission-critical platforms — core banking, payments, and multi-tenant SaaS.",
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
      text: "Moving legacy platforms forward safely, like .NET Framework to .NET 8, without stopping production.",
    },
    {
      title: "Security & identity",
      text: "OAuth2, JWT, and fine-grained multi-tenant authorization.",
    },
  ],
};

const Hero: React.FC = () => {
  const { profile } = usePortfolioData();
  const name = profile?.name || FALLBACK.name;
  const headline = profile?.headline || FALLBACK.headline;
  const summary = profile?.summary || FALLBACK.summary;
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
              <a href="#contact" className="action-btn secondary">
                Get in touch
              </a>
            </div>
          </div>

          <figure className="hero-photo">
            <div className="hero-window" aria-hidden="true">
              <span className="hero-window-dot" />
              <span className="hero-window-dot" />
              <span className="hero-window-dot" />
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

        <ul className="hero-pillars" aria-label="What I do">
          {pillars.map((pillar, index) => (
            <li className="hero-pillar" key={pillar.title}>
              <span className="hero-pillar-index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="hero-pillar-title">{pillar.title}</h2>
              <p className="hero-pillar-text">{pillar.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Hero;
