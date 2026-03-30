import React, { useState, useEffect } from "react";
import "./Portfolio.css";
import ApiService, { Project } from "../services/api";

const Portfolio: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState("all");
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await ApiService.getProjects();
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        // Set empty array on error - no hardcoded fallback
        setProjects([]);
      }
    };

    fetchProjects();
  }, []);

  const categories = ["all", "enterprise", "fintech", "cloud", "integration"];
  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter((project) => project.category === filter);

  return (
    <section id="portfolio" className="portfolio">
      <div className="portfolio-container">
        <div className="portfolio-header">
          <h2 className="portfolio-title">
            <span className="code-bracket">{"<"}</span>
            <span className="code-tag">projects</span>
            <span className="code-bracket">{"/>"}</span>
          </h2>
          <p className="portfolio-subtitle">Enterprise, Cloud & FinTech</p>

          <div className="filter-tabs">
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-tab ${filter === category ? "active" : ""}`}
                onClick={() => setFilter(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="projects-grid">
          {filteredProjects.map((project, index) => {
            const projectId = project._id || project.id || `project-${index}`;
            return (
              <div
                key={projectId}
                className={`project-card ${project.featured ? "featured" : ""} ${hoveredProject === projectId ? "hovered" : ""}`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onMouseEnter={() => setHoveredProject(projectId)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                <div className="project-header">
                  <h3 className="project-title">{project.title}</h3>
                  <div className="project-meta">
                    {project.featured && (
                      <span className="featured-badge">
                        <span className="featured-icon">⭐</span>
                        <span>Featured</span>
                      </span>
                    )}
                    <span
                      className={`status-badge ${project.status ? project.status.toLowerCase() : "active"}`}
                    >
                      {project.status || "Active"}
                    </span>
                    <span className="duration">
                      {project.duration || "Ongoing"}
                    </span>
                  </div>
                </div>

                <p className="project-description">{project.description}</p>

                <div className="technologies">
                  {(project.technologies || []).map((tech, techIndex) => (
                    <span key={techIndex} className="tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="project-actions">
                  <button
                    type="button"
                    className="project-link primary project-link-button"
                    onClick={() => setSelectedProject(project)}
                  >
                    <span className="link-icon">i</span>
                    <span>Project Details</span>
                  </button>
                  {project.github && (
                    <a href={project.github} className="project-link secondary">
                      <span className="link-icon">GH</span>
                      <span>Repository</span>
                    </a>
                  )}
                </div>

                <div className="project-glow"></div>
              </div>
            );
          })}
        </div>

        {selectedProject && (
          <div
            className="project-modal-overlay"
            onClick={() => setSelectedProject(null)}
          >
            <div
              className="project-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="project-modal-header">
                <div>
                  <h3 className="project-modal-title">{selectedProject.title}</h3>
                  <div className="project-meta">
                    {selectedProject.featured && (
                      <span className="featured-badge">
                        <span className="featured-icon">⭐</span>
                        <span>Featured</span>
                      </span>
                    )}
                    <span
                      className={`status-badge ${selectedProject.status ? selectedProject.status.toLowerCase() : "active"}`}
                    >
                      {selectedProject.status || "Active"}
                    </span>
                    <span className="duration">
                      {selectedProject.duration || "Ongoing"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="project-modal-close"
                  onClick={() => setSelectedProject(null)}
                  aria-label="Close project details"
                >
                  ×
                </button>
              </div>

              <p className="project-modal-description">
                {selectedProject.description}
              </p>

              <div className="project-modal-section">
                <span className="project-modal-label">Category</span>
                <span className="project-modal-value">
                  {selectedProject.category}
                </span>
              </div>

              <div className="project-modal-section">
                <span className="project-modal-label">Technologies</span>
                <div className="technologies">
                  {(selectedProject.technologies || []).map((tech, techIndex) => (
                    <span key={techIndex} className="tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="project-actions project-modal-actions">
                {selectedProject.github && (
                  <a
                    href={selectedProject.github}
                    className="project-link secondary"
                  >
                    <span className="link-icon">GH</span>
                    <span>Repository</span>
                  </a>
                )}
                {selectedProject.link &&
                  selectedProject.link.trim() !== "" &&
                  selectedProject.link.trim() !== "#" && (
                    <a href={selectedProject.link} className="project-link primary">
                      <span className="link-icon">↗</span>
                      <span>Open Project</span>
                    </a>
                  )}
              </div>
            </div>
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div className="no-projects">
            <div className="no-projects-icon">📁</div>
            <h3>No projects found</h3>
            <p>Try selecting a different category</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Portfolio;
