import React, { useState, useEffect, useMemo } from "react";
import "./About.css";
import ApiService, { ProfileData, Skill } from "../services/api";

const CATEGORY_LABELS: Record<string, string> = {
  backend: "Backend & Platforms",
  frontend: "Frontend",
  architecture: "Architecture",
  database: "Data & Databases",
  cloud: "Cloud & DevOps",
  integration: "Systems Integration",
  security: "Security",
  leadership: "Leadership",
  quality: "Quality Engineering",
  general: "Core Skills",
};

const About: React.FC = () => {
  const [typedCode, setTypedCode] = useState("");
  const [currentLine, setCurrentLine] = useState(0);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [codeLines, setCodeLines] = useState<string[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);

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
  }, [currentLine, codeLines]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfile(await ApiService.getProfile());
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchCodeLines = async () => {
      try {
        const codeData = await ApiService.getCodeDisplay();
        setCodeLines(codeData);
        setCurrentLine(0);
        setTypedCode("");
      } catch (error) {
        console.error("Error fetching code lines:", error);
        setCodeLines([]);
      }
    };
    fetchCodeLines();
  }, []);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setSkills(await ApiService.getSkills());
      } catch (error) {
        console.error("Error fetching skills:", error);
        setSkills([]);
      }
    };
    fetchSkills();
  }, []);

  // Group skills by category, strongest first within each group.
  const skillGroups = useMemo(() => {
    const groups = new Map<string, Skill[]>();
    skills.forEach((skill) => {
      const key = skill.category || "general";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(skill);
    });
    return Array.from(groups.entries())
      .map(([category, items]) => ({
        category,
        label: CATEGORY_LABELS[category] || category,
        items: [...items].sort((a, b) => b.level - a.level),
      }))
      .sort((a, b) => b.items[0].level - a.items[0].level);
  }, [skills]);

  return (
    <section id="about" className="about">
      <div className="about-container">
        <div className="about-header">
          <h2 className="about-title">
            <span className="code-bracket">{"<"}</span>
            <span className="code-tag">about</span>
            <span className="code-bracket">{"/>"}</span>
          </h2>
          <p className="about-subtitle">{profile?.headline || ""}</p>
        </div>

        <div className="about-content">
          <div className="code-showcase" aria-hidden="true">
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
            <h3 className="panel-title">Technical Expertise</h3>
            <p className="panel-subtitle">
              {skills.length} core competencies across{" "}
              {skillGroups.length} disciplines · {profile?.yearsExperience || ""}{" "}
              years
            </p>

            <div className="skill-groups">
              {skillGroups.map((group) => (
                <div className="skill-group" key={group.category}>
                  <h4 className="skill-group-title">{group.label}</h4>
                  <ul className="skill-list">
                    {group.items.map((skill) => (
                      <li className="skill-row" key={skill.name}>
                        <div className="skill-row-head">
                          <span className="skill-row-name">{skill.name}</span>
                          <span className="skill-row-level">{skill.level}%</span>
                        </div>
                        <div
                          className="skill-meter"
                          role="meter"
                          aria-valuenow={skill.level}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${skill.name} proficiency`}
                        >
                          <div
                            className="skill-meter-fill"
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                        {skill.description && (
                          <p className="skill-row-desc">{skill.description}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="experience-timeline">
          <h3 className="timeline-title">Career Highlights</h3>
          <div className="timeline-items">
            {(profile?.careerHighlights || []).map((highlight) => (
              <div className="timeline-item" key={highlight.title}>
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h4>{highlight.title}</h4>
                  <p>{highlight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
