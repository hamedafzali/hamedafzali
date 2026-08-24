import React from "react";
import "./Footer.css";
import { usePortfolioData } from "../context/PortfolioData";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { footer } = usePortfolioData();
  const footerData = footer || {
    copyright: "",
    navigationLinks: [] as { name: string; href: string }[],
    socialLinks: [] as { name: string; href: string; text: string }[],
  };

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
