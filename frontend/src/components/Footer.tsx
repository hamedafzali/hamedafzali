import React from "react";
import "./Footer.css";
import { usePortfolioData } from "../context/PortfolioData";

// Used when the footer API is unavailable, so the footer is never empty.
const FALLBACK_SOCIAL = [
  { name: "linkedin", href: "https://linkedin.com/in/hamed-afzali", text: "LinkedIn" },
  { name: "github", href: "https://github.com/hamedafzali", text: "GitHub" },
  { name: "email", href: "mailto:afzali.hamed@gmail.com", text: "Email" },
];

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { footer, profile } = usePortfolioData();
  const social = footer?.socialLinks?.length ? footer.socialLinks : FALLBACK_SOCIAL;
  const name = profile?.name || "Hamed Afzali";

  return (
    <footer className="footer">
      <div className="container footer-content">
        <p className="footer-info">
          &copy; {currentYear} {name}
          <span className="footer-sep" aria-hidden="true">·</span>
          <span className="footer-location">{profile?.location || "Tübingen, Germany"}</span>
        </p>
        <ul className="footer-social">
          {social.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                {...(link.href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {link.text}
              </a>
            </li>
          ))}
          <li>
            <a href="#main-content" className="footer-top">
              Back to top ↑
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
