import React, { useEffect, useState } from "react";
import "./Footer.css";
import ApiService from "../services/api";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [footerData, setFooterData] = useState({
    copyright: "",
    navigationLinks: [] as { name: string; href: string }[],
    socialLinks: [] as { name: string; href: string; text: string }[],
  });

  // Fetch footer data from backend
  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const data = await ApiService.getFooter();
        setFooterData(data);
      } catch (error) {
        console.error("Error fetching footer data:", error);
        setFooterData({
          copyright: "",
          navigationLinks: [],
          socialLinks: [],
        });
      }
    };

    fetchFooterData();
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
