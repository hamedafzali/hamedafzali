import React, { useState, useEffect } from "react";
import "./Navigation.css";
import ApiService, { ProfileData } from "../services/api";

const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [navItems, setNavItems] = useState<
    { name: string; href: string; icon: string }[]
  >([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const [data, profileData] = await Promise.all([
          ApiService.getFooter(),
          ApiService.getProfile(),
        ]);
        setNavItems(
          data.navigationLinks.map((link) => ({
            ...link,
            icon:
              link.name === "about"
                ? "👤"
                : link.name === "portfolio"
                  ? "💼"
                  : "📧",
          })),
        );
        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching navigation data:", error);
        setNavItems([]);
        setProfile(null);
      }
    };

    fetchFooterData();
  }, []);

  return (
    <nav className={`navigation ${isScrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <div className="nav-header">
          <div className="nav-brand">
            <span className="brand-icon">{"< />"}</span>
            <span className="brand-text">{profile?.brand || ""}</span>
          </div>

          <div
            id="nav-menu"
            className={`nav-menu ${isMobileMenuOpen ? "open" : ""}`}
          >
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

          </div>

          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="nav-menu"
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
