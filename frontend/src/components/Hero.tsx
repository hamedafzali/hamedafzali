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
  stats: [
    { value: "20+", label: "years building production software" },
    { value: "15k", label: "concurrent users on core banking" },
    { value: "400+", label: "branches on one analytics platform" },
    { value: "9 yrs", label: "leading an 8-person team" },
  ],
};

const Hero: React.FC = () => {
  const { profile } = usePortfolioData();
  const name = profile?.name || FALLBACK.name;
  const headline = profile?.headline || FALLBACK.headline;
  const summary = profile?.summary || FALLBACK.summary;
  const stats = profile?.stats?.length ? profile.stats : FALLBACK.stats;

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

        <dl className="hero-stats">
          {stats.map((stat) => (
            <div className="hero-stat" key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};

export default Hero;
