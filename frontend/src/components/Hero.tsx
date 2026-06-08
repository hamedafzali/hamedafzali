import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./Hero.css";
import ApiService, { ProfileData, Skill } from "../services/api";
import { useTypingAnimation } from "../hooks/useTypingAnimation";

const Hero: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [positions, setPositions] = useState<{
    [key: string]: { x: number; y: number };
  }>({
    editor: { x: 0, y: 0 },
    terminal: { x: 0, y: 0 },
    skills: { x: 0, y: 0 },
    photo: { x: 0, y: 0 },
  });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [maxZIndex, setMaxZIndex] = useState(5);
  const [elementZIndices, setElementZIndices] = useState<{
    [key: string]: number;
  }>({
    photo: 1,
    editor: 2,
    terminal: 3,
    skills: 4,
  });
  const photoRef = useRef<HTMLDivElement>(null);

  const roles = useMemo(() => profile?.roles ?? [], [profile]);
  const { text: typedText } = useTypingAnimation(roles);

  const colorSchemes = {
    blue: { primary: "#48c6b6", secondary: "#3c6df0", accent: "#8bd3ff" },
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileData, skillsData] = await Promise.all([
          ApiService.getProfile(),
          ApiService.getSkills(),
        ]);
        setProfile(profileData);
        setSkills(skillsData);
      } catch (error) {
        console.error("Error fetching hero data:", error);
        setProfile(null);
        setSkills([]);
      }
    };

    fetchProfileData();
  }, []);

  const getZIndex = (itemId: string) => {
    return elementZIndices[itemId] || 1;
  };

  const handleClick = useCallback(
    (itemId: string) => {
      if (itemId === "actions") return; // Don't handle actions

      setActiveItem(itemId);

      // Give the clicked element the highest z-index + 1
      const newMaxZIndex = maxZIndex + 1;
      const newIndices = {
        ...elementZIndices,
        [itemId]: newMaxZIndex,
      };

      setMaxZIndex(newMaxZIndex);
      setElementZIndices(newIndices);
    },
    [maxZIndex, elementZIndices],
  );

  const handleClickWithStop = (e: React.MouseEvent, itemId: string) => {
    // Don't prevent default for actions div to allow links to work
    if (itemId !== "actions") {
      e.preventDefault();
      e.stopPropagation();
      handleClick(itemId);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, itemId: string) => {
    if (itemId === "actions") return; // Don't allow dragging actions

    setActiveItem(itemId);
    setDraggingItem(itemId);

    // Give the dragged element the highest z-index + 1
    setMaxZIndex((prev) => {
      const newMaxZIndex = prev + 1;
      const newIndices = {
        ...elementZIndices,
        [itemId]: newMaxZIndex,
      };

      setElementZIndices(newIndices);
      return newMaxZIndex;
    });

    const currentPosition = positions[itemId] || { x: 0, y: 0 };

    // Calculate the offset from where the user clicked to the element's current position
    setDragStart({
      x: e.clientX - currentPosition.x,
      y: e.clientY - currentPosition.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingItem) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    setPositions((prev) => ({
      ...prev,
      [draggingItem]: { x: newX, y: newY },
    }));
  };

  const handleMouseUp = () => {
    setDraggingItem(null);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!draggingItem) return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      setPositions((prev) => ({
        ...prev,
        [draggingItem]: { x: newX, y: newY },
      }));
    };

    const handleGlobalMouseUp = () => {
      setDraggingItem(null);
    };

    if (draggingItem) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [draggingItem, dragStart]);

  const scheme = colorSchemes.blue;

  const topSkills = skills.slice(0, 5);

  return (
    <section
      className="hero"
      style={
        {
          "--primary-color": scheme.primary,
          "--secondary-color": scheme.secondary,
          "--accent-color": scheme.accent,
        } as React.CSSProperties
      }
    >
      <div className="hero-intro">
        {profile?.availabilityStatus && (
          <p className="hero-eyebrow">{profile.availabilityStatus}</p>
        )}
        <h1 className="hero-headline">
          {profile?.name || " "}
          <span className="hero-role">{profile?.headline || ""}</span>
        </h1>
        <p className="hero-lede">{profile?.summary || ""}</p>
        <div className="hero-cta">
          <a href="#portfolio" className="action-btn primary">
            View Projects
          </a>
          <a href="#contact" className="action-btn secondary">
            Get in Touch
          </a>
        </div>
      </div>

      <div
        aria-hidden="true"
        className={`code-editor ${activeItem === "editor" ? "active" : ""} ${draggingItem === "editor" ? "dragging" : ""} ${positions.editor?.x !== 0 || positions.editor?.y !== 0 ? "moved" : ""}`}
        style={{
          transform: `translate(${positions.editor?.x || 0}px, ${positions.editor?.y || 0}px)`,
          zIndex:
            draggingItem === "editor" ? maxZIndex + 1 : getZIndex("editor"),
        }}
        onClick={(e) => handleClickWithStop(e, "editor")}
        onMouseDown={(e) => handleMouseDown(e, "editor")}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div className="editor-header">
          <div className="editor-controls">
            <span className="control close"></span>
            <span className="control minimize"></span>
            <span className="control maximize"></span>
          </div>
          <div className="editor-title">
            <span className="file-icon">👨‍💻</span>
            <span>{profile?.brand ? `${profile.brand}.portfolio` : ""}</span>
          </div>
          <div className="editor-actions">
            <button className="run-btn">▶ Run</button>
          </div>
        </div>

        <div className="editor-content">
          <div className="line-numbers">
            {Array.from({ length: 20 }, (_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>

          <div className="code-content">
            <div className="code-line">
              <span className="keyword">const</span>
              <span className="variable"> developer</span>
              <span className="operator"> =</span>
              <span className="punctuation">{"{"}</span>
            </div>

            <div className="code-line">
              <span className="property"> name</span>
              <span className="operator">:</span>
              <span className="string"> '{profile?.name || ""}'</span>
              <span className="punctuation">,</span>
            </div>

            <div className="code-line">
              <span className="property"> title</span>
              <span className="operator">:</span>
              <span className="string"> '{typedText}'</span>
              <span className="cursor">|</span>
            </div>

            <div className="code-line">
              <span className="property"> experience</span>
              <span className="operator">:</span>
              <span className="number"> {profile?.yearsExperience || ""}</span>
              <span className="punctuation">,</span>
            </div>

            <div className="code-line">
              <span className="property"> specialization</span>
              <span className="operator">:</span>
              <span className="punctuation">[</span>
            </div>

            {(profile?.specializations || []).map((specialization, index) => (
              <div className="code-line" key={specialization}>
                <span className="string"> '{specialization}'</span>
                {index < (profile?.specializations.length || 0) - 1 && (
                  <span className="punctuation">,</span>
                )}
              </div>
            ))}

            <div className="code-line">
              <span className="punctuation"> ]</span>
            </div>

            <div className="code-line">
              <span className="property"> location</span>
              <span className="operator">:</span>
              <span className="string"> '{profile?.location || ""}'</span>
            </div>

            <div className="code-line">
              <span className="property"> status</span>
              <span className="operator">:</span>
              <span className="string"> '{profile?.availabilityStatus || ""}'</span>
            </div>

            <div className="code-line">
              <span className="punctuation">{"}"}</span>
              <span className="punctuation">;</span>
            </div>

            <div className="code-line comment">
              <span className="comment">{"// Click below to explore my work"}</span>
            </div>

            <div className="code-line">
              <span className="keyword">await</span>
              <span className="function"> explorePortfolio</span>
              <span className="punctuation">();</span>
            </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className={`floating-terminal ${activeItem === "terminal" ? "active" : ""} ${draggingItem === "terminal" ? "dragging" : ""} ${positions.terminal?.x !== 0 || positions.terminal?.y !== 0 ? "moved" : ""}`}
        style={{
          transform: `translate(${positions.terminal?.x || 0}px, ${positions.terminal?.y || 0}px)`,
          zIndex:
            draggingItem === "terminal" ? maxZIndex + 1 : getZIndex("terminal"),
        }}
        onClick={(e) => handleClickWithStop(e, "terminal")}
        onMouseDown={(e) => handleMouseDown(e, "terminal")}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div className="terminal-header">
          <span className="terminal-title">Terminal</span>
          <div className="terminal-controls">
            <span className="terminal-control">×</span>
          </div>
        </div>
        <div className="terminal-content">
          <div className="terminal-line">
            <span className="prompt">$</span>
            <span className="command"> git status</span>
          </div>
          <div className="terminal-output">
            On branch main Your portfolio is up-to-date
          </div>
          <div className="terminal-line">
            <span className="prompt">$</span>
            <span className="command typing"> npm run portfolio:explore</span>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className={`skill-visualization ${activeItem === "skills" ? "active" : ""} ${draggingItem === "skills" ? "dragging" : ""} ${positions.skills?.x !== 0 || positions.skills?.y !== 0 ? "moved" : ""}`}
        style={{
          transform: `translate(${positions.skills?.x || 0}px, ${positions.skills?.y || 0}px)`,
          zIndex:
            draggingItem === "skills" ? maxZIndex + 1 : getZIndex("skills"),
        }}
        onClick={(e) => handleClickWithStop(e, "skills")}
        onMouseDown={(e) => handleMouseDown(e, "skills")}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <h3 className="viz-title">Technical Expertise</h3>
        <div className="skill-bars">
          {topSkills.map((skill, index) => (
            <div
              key={skill.name}
              className="skill-item"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="skill-info">
                <span className="skill-name">{skill.name}</span>
                <span className="skill-level">{skill.level}%</span>
              </div>
              <div className="skill-bar">
                <div
                  className="skill-progress"
                  style={{
                    width: `${skill.level}%`,
                    background: `linear-gradient(90deg, ${scheme.primary}, ${scheme.accent})`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`photo-sticker ${activeItem === "photo" ? "active" : ""} ${draggingItem === "photo" ? "dragging" : ""} ${positions.photo?.x !== 0 || positions.photo?.y !== 0 ? "moved" : ""}`}
        ref={photoRef}
        style={{
          transform: `translate(${positions.photo?.x || 0}px, ${positions.photo?.y || 0}px) rotate(-2deg)`,
          zIndex: draggingItem === "photo" ? maxZIndex + 1 : getZIndex("photo"),
        }}
        onClick={(e) => handleClickWithStop(e, "photo")}
        onMouseDown={(e) => handleMouseDown(e, "photo")}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <img
          src="/hamedafzali.png"
          alt={`${profile?.name || "Hamed Afzali"} — ${profile?.headline || "Senior Engineer"}`}
          className="sticker-photo"
          width={250}
          height={250}
          draggable={false}
        />
        <div className="sticker-shadow"></div>
      </div>

      <div className="scroll-indicator">
        <div className="scroll-text">Scroll to explore</div>
        <div className="scroll-arrow">↓</div>
      </div>
    </section>
  );
};

export default Hero;
