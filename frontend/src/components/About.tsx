import React, { useState, useEffect } from "react";
import "./About.css";
import ApiService from "../services/api";

const About: React.FC = () => {
  const [typedCode, setTypedCode] = useState("");
  const [currentLine, setCurrentLine] = useState(0);
  const [skills, setSkills] = useState<any[]>([]); // Start with empty array
  const [codeLines, setCodeLines] = useState<string[]>([]); // Start with empty array

  useEffect(() => {
    if (currentLine < codeLines.length) {
      const line = codeLines[currentLine];
      let charIndex = 0;

      const typeInterval = setInterval(() => {
        if (charIndex <= line.length) {
          setTypedCode((prev) => {
            const lines = prev.split("\n");
            if (lines.length <= currentLine) {
              lines.push("");
            }
            lines[currentLine] = line.slice(0, charIndex);
            return lines.join("\n");
          });
          charIndex++;
        } else {
          clearInterval(typeInterval);
          setTimeout(() => {
            setCurrentLine((prev) => prev + 1);
          }, 500);
        }
      }, 50);

      return () => clearInterval(typeInterval);
    }
  }, [currentLine, codeLines]); // Added codeLines dependency

  // Fetch code lines from backend
  useEffect(() => {
    const fetchCodeLines = async () => {
      try {
        const codeData = await ApiService.getCodeDisplay();
        setCodeLines(codeData);
        // Reset typing animation when new code lines are loaded
        setCurrentLine(0);
        setTypedCode("");
      } catch (error) {
        console.error("Error fetching code lines:", error);
        // Set empty array on error
        setCodeLines([]);
      }
    };

    fetchCodeLines();
  }, []);

  // Fetch skills from backend
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const backendSkills = await ApiService.getSkills();

        // Transform backend data to match our format
        const transformedSkills = backendSkills.map(
          (skill: any, index: number) => ({
            name: skill.name || `Skill ${index + 1}`,
            level: skill.level || 85,
            category: skill.category || "general",
            change: parseFloat((Math.random() * 10 - 5).toFixed(1)),
            volume: ["Low", "Medium", "High"][
              Math.floor(Math.random() * 3)
            ] as string,
            trend: Math.random() > 0.5 ? ("up" as string) : ("down" as string),
          }),
        );

        setSkills(transformedSkills);
      } catch (error) {
        console.error("Error fetching skills:", error);
        // Set empty array on error - no hardcoded fallback
        setSkills([]);
      }
    };

    fetchSkills();
  }, []);

  return (
    <section id="about" className="about">
      <div className="about-container">
        <div className="about-header">
          <h2 className="about-title">
            <span className="code-bracket">{"<"}</span>
            <span className="code-tag">about</span>
            <span className="code-bracket">{"/>"}</span>
          </h2>
          <p className="about-subtitle">
            Senior Full-Stack Engineer · Systems Architect
          </p>
        </div>

        <div className="about-content">
          <div className="code-showcase">
            <div className="code-editor-about">
              <div className="editor-header-about">
                <div className="editor-controls-about">
                  <span className="control-about close"></span>
                  <span className="control-about minimize"></span>
                  <span className="control-about maximize"></span>
                </div>
                <div className="editor-title-about">developer.js</div>
              </div>
              <div className="editor-content-about">
                <div className="code-content-about">
                  <pre className="typed-code">{typedCode}</pre>
                  <span className="typing-cursor">|</span>
                </div>
              </div>
            </div>
          </div>

          <div className="expertise-panel">
            <h3 className="panel-title">Technical Expertise Market</h3>
            <div className="market-header">
              <div className="market-time">
                <span className="live-indicator">● LIVE</span>
                <span className="timestamp">
                  Last Updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
              <div className="market-summary">
                <span className="summary-item">
                  <span className="summary-label">Portfolio:</span>
                  <span className="summary-value positive">+2.8%</span>
                </span>
              </div>
            </div>

            <div className="stock-table">
              <div className="table-header">
                <div className="header-cell symbol">SYMBOL</div>
                <div className="header-cell price">PRICE</div>
                <div className="header-cell change">CHANGE</div>
                <div className="header-cell volume">VOLUME</div>
                <div className="header-cell category">SECTOR</div>
              </div>

              <div className="table-body">
                {skills.map((skill, index) => (
                  <div
                    key={skill.name}
                    className="table-row"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="cell symbol">
                      <div className="ticker">{skill.name.split(" ")[0]}</div>
                      <div className="full-name">{skill.name}</div>
                    </div>
                    <div className="cell price">
                      <span className="price-value">${skill.level}</span>
                    </div>
                    <div className={`cell change ${skill.trend}`}>
                      <span className="change-indicator">
                        {skill.trend === "up" ? "▲" : "▼"}
                      </span>
                      <span className="change-value">
                        {Math.abs(skill.change)}%
                      </span>
                    </div>
                    <div className="cell volume">
                      <div className="volume-bar">
                        <div
                          className="volume-fill"
                          style={{
                            width:
                              skill.volume === "High"
                                ? "80%"
                                : skill.volume === "Medium"
                                  ? "50%"
                                  : "20%",
                          }}
                        ></div>
                      </div>
                      <span className="volume-text">{skill.volume}</span>
                    </div>
                    <div className="cell category">
                      <span className="category-badge">{skill.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="market-footer">
              <div className="market-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Skills:</span>
                  <span className="stat-value">{skills.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Avg Proficiency:</span>
                  <span className="stat-value">
                    {skills.length > 0
                      ? Math.round(
                          skills.reduce((acc, s) => acc + s.level, 0) /
                            skills.length,
                        ) + "%"
                      : "0%"}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Top Performer:</span>
                  <span className="stat-value">
                    {skills.length > 0
                      ? skills
                          .reduce((max, s) => (s.level > max.level ? s : max))
                          .name.split(" ")[0]
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="experience-timeline">
              <h3 className="timeline-title">Career Highlights</h3>
              <div className="timeline-items">
                <div className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h4>15+ Years Experience</h4>
                    <p>
                      Enterprise software development and system architecture
                    </p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h4>50+ Enterprise Projects</h4>
                    <p>
                      Core banking, distributed systems, and cloud-native
                      solutions
                    </p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h4>Team Leadership</h4>
                    <p>
                      10+ years leading development teams and technical strategy
                    </p>
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

export default About;
