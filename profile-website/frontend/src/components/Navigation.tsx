import React, { useState, useEffect } from "react";
import "./Navigation.css";

const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "about", href: "#about", icon: "👤" },
    { name: "portfolio", href: "#portfolio", icon: "💼" },
    { name: "contact", href: "#contact", icon: "📧" },
  ];

  const socialLinks = [
    { name: "github", href: "https://github.com", icon: "🐙" },
    {
      name: "linkedin",
      href: "https://linkedin.com/in/hamed-afzali",
      icon: "💼",
    },
    { name: "email", href: "mailto:afzali.hamed@gmail.com", icon: "✉️" },
  ];

  return (
    <nav className={`navigation ${isScrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <div className="nav-header">
          <div className="nav-brand">
            <span className="brand-icon">{"< />"}</span>
            <span className="brand-text">hamed.dev</span>
          </div>

          <div className={`nav-menu ${isMobileMenuOpen ? "open" : ""}`}>
            <div className="nav-links">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.name}</span>
                  <span className="nav-bracket">{"</>"}</span>
                </a>
              ))}
            </div>

            <div className="social-links">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.name}
                >
                  <span className="social-icon">{link.icon}</span>
                </a>
              ))}
            </div>
          </div>

          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
