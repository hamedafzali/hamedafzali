import React, { useState, useEffect, useRef } from "react";
import "./Contact.css";
import ApiService from "../services/api";

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [terminalText, setTerminalText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [terminalCommands, setTerminalCommands] = useState<string[]>([]);

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

  useEffect(() => {
    let commandIndex = 0;
    let charIndex = 0;

    const typeCommand = () => {
      if (commandIndex < terminalCommands.length) {
        const currentCommand = terminalCommands[commandIndex];
        setIsTyping(true);

        if (charIndex <= currentCommand.length) {
          setTerminalText(currentCommand.slice(0, charIndex));
          charIndex++;
          setTimeout(typeCommand, 100);
        } else {
          setIsTyping(false);
          setTimeout(() => {
            setTerminalText("");
            charIndex = 0;
            commandIndex++;
            if (commandIndex < terminalCommands.length) {
              setTimeout(typeCommand, 500);
            }
          }, 2000);
        }
      }
    };

    const interval = setTimeout(typeCommand, 1000);
    return () => clearTimeout(interval);
  }, [terminalCommands]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await ApiService.submitContact(formData);
      alert("Thank you for your message! I will get back to you soon.");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      alert(
        "Sorry, there was an error sending your message. Please try again.",
      );
    }
  };

  const contactMethods = [
    {
      icon: "📧",
      label: "Email",
      value: "afzali.hamed@gmail.com",
      href: "mailto:afzali.hamed@gmail.com",
      command: "mail afzali.hamed@gmail.com",
    },
    {
      icon: "📱",
      label: "Phone",
      value: "+49 (0) 176 3146 1176",
      href: "tel:+4917631461176",
      command: "call +4917631461176",
    },
    {
      icon: "💼",
      label: "LinkedIn",
      value: "linkedin.com/in/hamed-afzali",
      href: "https://linkedin.com/in/hamed-afzali",
      command: "open https://linkedin.com/in/hamed-afzali",
    },
    {
      icon: "📍",
      label: "Location",
      value: "Tübingen, Germany",
      href: "#",
      command: "map Tübingen, Germany",
    },
  ];

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
            Let's build something durable and scalable
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
                    Hamed Afzali - Senior Full-Stack Engineer
                  </div>
                  <div className="output-line">Location: Tübingen, Germany</div>
                  <div className="output-line">
                    Status: Available for opportunities
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

                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    <span className="btn-icon">🚀</span>
                    <span className="btn-text">Send Message</span>
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
                    Open to new opportunities and collaborations
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
