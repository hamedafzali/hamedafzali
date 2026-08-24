import React from "react";
import "./Hero.css";
import { usePortfolioData } from "../context/PortfolioData";

const Hero: React.FC = () => {
  const { profile } = usePortfolioData();

  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-content">
          {profile?.availabilityStatus && (
            <p className="hero-eyebrow">{profile.availabilityStatus}</p>
          )}
          <h1 className="hero-headline">
            {profile?.name || " "}
            <span className="hero-role">{profile?.headline || ""}</span>
          </h1>
          <p className="hero-lede">{profile?.summary || ""}</p>
          <div className="hero-cta">
            <a href="#portfolio" className="action-btn primary">
              View Projects
            </a>
            <a href="#contact" className="action-btn secondary">
              Get in Touch
            </a>
          </div>
        </div>

        <div className="hero-photo">
          <img
            src="/hamedafzali.png"
            alt={`${profile?.name || "Hamed Afzali"} — ${profile?.headline || "Senior Engineer"}`}
            width={360}
            height={540}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
