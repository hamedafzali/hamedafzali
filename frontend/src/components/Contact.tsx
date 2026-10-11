import React, { useState, useEffect } from "react";
import "./Contact.css";
import ApiService from "../services/api";
import { usePortfolioData } from "../context/PortfolioData";
import { useTypingAnimation } from "../hooks/useTypingAnimation";

const Contact: React.FC = () => {
  const { profile } = usePortfolioData();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [terminalCommands, setTerminalCommands] = useState<string[]>([]);
  const { text: terminalText, isTyping } = useTypingAnimation(terminalCommands);

  // Fetch terminal commands from backend
  useEffect(() => {
    const fetchTerminalCommands = async () => {
      try {
        const data = await ApiService.getTerminalCommands();
        // The prompt is rendered separately, so drop any "$ " in the data.
        setTerminalCommands(data.commands.map((c) => c.replace(/^\$\s*/, "")));
      } catch (error) {
        console.error("Error fetching terminal commands:", error);
        // Set empty array on error - fallback will be handled by backend
        setTerminalCommands([]);
      }
    };

    fetchTerminalCommands();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (formSuccess) setFormSuccess(false);
    if (formError) setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.name.trim().length < 2) {
      setFormError("Name must be at least 2 characters.");
      return;
    }
    if (!emailRegex.test(formData.email)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (formData.message.trim().length < 10) {
      setFormError("Message must be at least 10 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await ApiService.submitContact(formData);
      setFormSuccess(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      setFormError(`Failed to send message: ${message}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = profile?.contactMethods || [];

  return (
    <section id="contact" className="contact">
      <div className="container">
        <header className="section-head">
          <h2 className="section-title">
            <span className="code-bracket">{"<"}</span>
            <span className="code-tag">contact</span>
            <span className="code-bracket">{"/>"}</span>
          </h2>
          <p className="section-subtitle">{profile?.contactIntro || ""}</p>
        </header>

        <div className="contact-grid">
          <div className="contact-aside">
            <div className="contact-terminal" aria-hidden="true">
              <div className="contact-terminal-bar">
                <span className="contact-terminal-dot" />
                <span className="contact-terminal-dot" />
                <span className="contact-terminal-dot" />
                <span className="contact-terminal-title">hamed@portfolio:~</span>
              </div>
              <div className="contact-terminal-body">
                <span className="contact-terminal-prompt">$</span> {terminalText}
                {isTyping && <span className="contact-terminal-cursor" />}
              </div>
            </div>

            <ul className="contact-methods">
              {contactMethods.map((method) => {
                const isLink = !!method.href && !method.href.startsWith("#");
                const content = (
                  <>
                    <span className="contact-method-icon" aria-hidden="true">
                      <ContactIcon label={method.label} />
                    </span>
                    <span className="contact-method-text">
                      <span className="contact-method-label">{method.label}</span>
                      <span className="contact-method-value">{method.value}</span>
                    </span>
                  </>
                );
                return (
                  <li key={method.label}>
                    {isLink ? (
                      <a
                        href={method.href}
                        className="contact-method"
                        {...(method.href.startsWith("http")
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {content}
                      </a>
                    ) : (
                      <div className="contact-method">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="contact-form" noValidate>
            <h3 className="contact-form-title">Send a message</h3>

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                aria-invalid={!!formError}
                aria-describedby={formError ? "form-error" : undefined}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message" className="form-label">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="form-input form-textarea"
              ></textarea>
            </div>

            <div aria-live="polite" className="form-feedback">
              {formError && (
                <p className="form-error" id="form-error" role="alert">
                  {formError}
                </p>
              )}
              {formSuccess && (
                <p className="form-success" role="status">
                  Thanks, your message was sent. I'll reply as soon as I can.
                </p>
              )}
            </div>

            <button type="submit" className="action-btn primary form-submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending…" : "Send message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

const ICON_PATHS: Record<string, string> = {
  Email: "M4 6h16v12H4z M4 7l8 6 8-6",
  Phone:
    "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z",
  LinkedIn: "M4 4h16v16H4z M8 10v6 M8 7.5v.01 M12 16v-6 M12 13a2.5 2.5 0 0 1 5 0v3",
  Location: "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
};

const ContactIcon: React.FC<{ label: string }> = ({ label }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={ICON_PATHS[label] || ICON_PATHS.Location} />
  </svg>
);

export default Contact;
