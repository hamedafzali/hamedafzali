import React, { useState, useEffect, useCallback } from "react";
import "./Navigation.css";
import { usePortfolioData } from "../context/PortfolioData";

// Section links are static so the menu never depends on an API response.
const NAV_ITEMS = [
  { id: "about", label: "about" },
  { id: "portfolio", label: "work" },
  { id: "contact", label: "contact" },
];

const Navigation: React.FC = () => {
  const { profile } = usePortfolioData();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const closeMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Highlight the section currently in the middle of the viewport.
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Mobile sheet: lock page scroll and close on Escape while open.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeMenu();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isMobileMenuOpen, closeMenu]);

  return (
    <nav
      className={`navigation ${isScrolled ? "scrolled" : ""}`}
      aria-label="Primary"
    >
      <div className="nav-container">
        <div className="nav-header">
          <a href="#main-content" className="nav-brand" onClick={closeMenu}>
            <span className="brand-icon" aria-hidden="true">
              {"</>"}
            </span>
            <span className="brand-text">{profile?.brand || "hamed afzali"}</span>
          </a>

          <div
            id="nav-menu"
            className={`nav-menu ${isMobileMenuOpen ? "open" : ""}`}
          >
            <ul className="nav-links">
              {NAV_ITEMS.map((item, index) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`nav-link ${activeId === item.id ? "active" : ""}`}
                    aria-current={activeId === item.id ? "true" : undefined}
                    onClick={closeMenu}
                  >
                    <span className="nav-index" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="nav-text">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
            <a href="#contact" className="nav-cta" onClick={closeMenu}>
              Get in touch
            </a>
          </div>

          <button
            className={`mobile-menu-toggle ${isMobileMenuOpen ? "open" : ""}`}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="nav-menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="nav-backdrop" onClick={closeMenu} aria-hidden="true" />
      )}
    </nav>
  );
};

export default Navigation;
