import React, { useState, useEffect, useMemo } from "react";
import "./Portfolio.css";
import ApiService, { Project } from "../services/api";

const FILTERS = [
  { id: "featured", label: "Featured" },
  { id: "all", label: "All" },
  { id: "enterprise", label: "Enterprise" },
  { id: "fintech", label: "FinTech" },
  { id: "ai", label: "AI" },
  { id: "cloud", label: "Cloud" },
  { id: "integration", label: "Integration" },
];

const MAX_TAGS = 5;
// A category tab with a single project is noise: hide it.
const MIN_PER_FILTER = 2;
// Descriptions longer than this are clamped with an inline "Read more".
const CLAMP_AT = 220;

const hasLink = (link?: string) => !!link && link.trim() !== "" && link.trim() !== "#";

const Portfolio: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState("featured");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    ApiService.getProjects()
      .then(setProjects)
      .catch(() => setProjects([]));
  }, []);

  const matches = (project: Project, id: string) =>
    id === "all" ? true : id === "featured" ? project.featured : project.category === id;

  const counts = useMemo(
    () =>
      Object.fromEntries(
        FILTERS.map(({ id }) => [id, projects.filter((p) => matches(p, id)).length]),
      ),
    [projects],
  );

  const showFilter = (id: string) =>
    !projects.length || id === "featured" || id === "all" || counts[id] >= MIN_PER_FILTER;

  const visible = projects.filter((p) => matches(p, filter));

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <section id="portfolio" className="portfolio">
      <div className="container">
        <header className="section-head">
          <h2 className="section-title">
            <span className="code-bracket" aria-hidden="true">{"<"}</span>
            <span className="code-tag">work</span>
            <span className="code-bracket" aria-hidden="true">{"/>"}</span>
          </h2>
          <p className="section-subtitle">
            Systems I designed, led, or built, from national payment
            networks to multi-tenant SaaS.
          </p>

          <div className="filter-tabs" role="group" aria-label="Filter projects">
            {FILTERS.filter(({ id }) => showFilter(id)).map(
              ({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  className={`filter-tab ${filter === id ? "active" : ""}`}
                  aria-pressed={filter === id}
                  onClick={() => setFilter(id)}
                >
                  {label}
                  {projects.length > 0 && (
                    <span className="filter-count">{counts[id]}</span>
                  )}
                </button>
              ),
            )}
          </div>
        </header>

        <ul className="projects-grid">
          {visible.map((project, index) => {
            const id = project._id || project.id || `project-${index}`;
            const isOpen = expanded.has(id);
            const long = project.description.length > CLAMP_AT;
            const tags = project.technologies || [];
            const active = (project.status || "").toLowerCase() === "active";
            return (
              <li key={id} className="project-card">
                <div className="project-meta">
                  <span className={`project-status ${active ? "active" : ""}`}>
                    {active ? "Current" : project.status || "Completed"}
                  </span>
                  {project.duration && (
                    <span className="project-duration">{project.duration}</span>
                  )}
                </div>

                <h3 className="project-title">{project.title}</h3>

                <p
                  className={`project-description ${long && !isOpen ? "clamped" : ""}`}
                  id={`desc-${id}`}
                >
                  {project.description}
                </p>
                {long && (
                  <button
                    type="button"
                    className="project-more"
                    aria-expanded={isOpen}
                    aria-controls={`desc-${id}`}
                    onClick={() => toggle(id)}
                  >
                    {isOpen ? "Show less" : "Read more"}
                  </button>
                )}

                <ul className="technologies" aria-label="Technologies">
                  {(isOpen ? tags : tags.slice(0, MAX_TAGS)).map((tech) => (
                    <li key={tech} className="tech-tag">
                      {tech}
                    </li>
                  ))}
                  {!isOpen && tags.length > MAX_TAGS && (
                    <li className="tech-tag more">+{tags.length - MAX_TAGS}</li>
                  )}
                </ul>

                {(hasLink(project.link) || project.github) && (
                  <div className="project-actions">
                    {hasLink(project.link) && (
                      <a href={project.link} className="project-link">
                        Open project ↗
                      </a>
                    )}
                    {project.github && (
                      <a href={project.github} className="project-link">
                        Repository ↗
                      </a>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {projects.length > 0 && visible.length === 0 && (
          <p className="no-projects">No projects in this category.</p>
        )}
      </div>
    </section>
  );
};

export default Portfolio;
