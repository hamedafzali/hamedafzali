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
        setTerminalCommands(data.commands);
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

  const contactMethods = (profile?.contactMethods || []).map((method) => ({
    ...method,
    icon:
      method.label === "Email"
        ? "📧"
        : method.label === "Phone"
          ? "📱"
          : method.label === "LinkedIn"
            ? "💼"
            : "📍",
  }));

  return (
    <section id="contact" className="contact">
      <div className="contact-container">
        <div className="contact-header">
          <h2 className="contact-title">
            <span className="code-bracket">{"<"}</span>
            <span className="code-tag">contact</span>
            <span className="code-bracket">{"/>"}</span>
          </h2>
          <p className="contact-subtitle">
            {profile?.summary || ""}
          </p>
        </div>

        <div className="contact-content">
          <div className="terminal-section">
            <div className="terminal-contact">
              <div className="terminal-header-contact">
                <div className="terminal-controls-contact">
                  <span className="terminal-control-contact close"></span>
                  <span className="terminal-control-contact minimize"></span>
                  <span className="terminal-control-contact maximize"></span>
                </div>
                <div className="terminal-title-contact">hamed@portfolio:~$</div>
              </div>
              <div className="terminal-content-contact">
                <div className="terminal-line-contact">
                  <span className="prompt-contact">$</span>
                  <span className="command-contact">{terminalText}</span>
                  {isTyping && <span className="cursor-contact">|</span>}
                </div>
                <div className="terminal-output-contact">
                  <div className="output-line">
                    {profile ? `${profile.name} - ${profile.headline}` : ""}
                  </div>
                  <div className="output-line">
                    Location: {profile?.location || ""}
                  </div>
                  <div className="output-line">
                    Status: {profile?.availabilityStatus || ""}
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-methods">
              <h3 className="methods-title">Connect</h3>
              <div className="method-cards">
                {contactMethods.map((method, index) => (
                  <a
                    key={method.label}
                    href={method.href}
                    className="method-card"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="method-icon">{method.icon}</div>
                    <div className="method-info">
                      <span className="method-label">{method.label}</span>
                      <span className="method-value">{method.value}</span>
                    </div>
                    <div className="method-command">{method.command}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-terminal">
              <div className="form-header">
                <h3 className="form-title">Send Message</h3>
                <div className="form-status">
                  <span className="status-indicator online"></span>
                  <span className="status-text">Ready to receive</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="contact-form-terminal">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    <span className="label-icon">👤</span>
                    <span className="label-text">name</span>
                    <span className="label-bracket">{"<string>"}</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    aria-invalid={!!formError}
                    aria-describedby={formError ? "form-error" : undefined}
                    required
                    className="form-input"
                    placeholder="Enter your name..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    <span className="label-icon">📧</span>
                    <span className="label-text">email</span>
                    <span className="label-bracket">{"<string>"}</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    <span className="label-icon">💬</span>
                    <span className="label-text">message</span>
                    <span className="label-bracket">{"<string>"}</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="form-textarea"
                    placeholder="Tell me about your project..."
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
                      ✓ Thanks for reaching out — your message was sent. I'll
                      get back to you within 24 hours.
                    </p>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isSubmitting}
                  >
                    <span className="btn-icon">🚀</span>
                    <span className="btn-text">
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </span>
                    <span className="btn-command">npm run send:message</span>
                  </button>
                  <button
                    type="button"
                    className="reset-btn"
                    onClick={() =>
                      setFormData({ name: "", email: "", message: "" })
                    }
                  >
                    <span className="btn-icon">🔄</span>
                    <span className="btn-text">Reset</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="availability-status">
              <div className="status-card">
                <div className="status-header">
                  <span className="status-dot online"></span>
                  <span className="status-title">Current Status</span>
                </div>
                <div className="status-content">
                  <p className="status-message">
                    {profile?.availabilityStatus || ""}
                  </p>
                  <div className="response-time">
                    <span className="response-label">
                      Typical response time:
                    </span>
                    <span className="response-value">Within 24 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
