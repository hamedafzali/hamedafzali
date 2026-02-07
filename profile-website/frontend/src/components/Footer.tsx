import React, { useState, useEffect } from "react";
import "./Footer.css";
import ApiService from "../services/api";

const Footer: React.FC = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [footerData, setFooterData] = useState({
    copyright: "Profile. All rights reserved.",
    navigationLinks: [
      { name: "about", href: "#about" },
      { name: "portfolio", href: "#portfolio" },
      { name: "contact", href: "#contact" },
    ],
    socialLinks: [
      { name: "twitter", href: "https://twitter.com", text: "Twitter" },
      { name: "linkedin", href: "https://linkedin.com", text: "LinkedIn" },
      { name: "github", href: "https://github.com", text: "GitHub" },
    ],
  });

  // Fetch footer data from backend
  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const data = await ApiService.getFooter();
        setFooterData(data);
      } catch (error) {
        console.error("Error fetching footer data:", error);
        // Keep using default data on error
      }
    };

    fetchFooterData();
  }, []);

  // Update current year every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentYear(new Date().getFullYear());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-info">
            <p>
              &copy; {currentYear} {footerData.copyright}
            </p>
          </div>
          <div className="footer-links">
            {footerData.navigationLinks.map((link) => (
              <a key={link.name} href={link.href}>
                {link.name}
              </a>
            ))}
          </div>
          <div className="footer-social">
            {footerData.socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {social.text}
              </a>
            ))}
          </div>
        </div>
        <button
          className="back-to-top"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          Back to top
        </button>
      </div>
    </footer>
  );
};

export default Footer;
