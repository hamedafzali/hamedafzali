// API Service - Centralized API calls for the application
// Default to same-origin API so Docker/remote deployments work.
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, "") || "/api";

// Types for API responses
export interface Project {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  category: string;
  image: string;
  link: string;
  featured: boolean;
  technologies: string[];
  github?: string;
  status?: string;
  duration?: string;
}

export interface Skill {
  _id?: string;
  name: string;
  class: string;
  level: number;
  category: string;
  description: string;
  createdAt?: string;
}

export interface Contact {
  _id?: string;
  name: string;
  email: string;
  message: string;
  createdAt?: string;
}

export interface CodeDisplay {
  codeLines: string[];
}

export interface ProfileData {
  _id?: string;
  name: string;
  brand: string;
  headline: string;
  summary: string;
  location: string;
  availabilityStatus: string;
  yearsExperience: string;
  roles: string[];
  specializations: string[];
  contactMethods: {
    label: string;
    value: string;
    href: string;
    command: string;
  }[];
  careerHighlights: {
    title: string;
    description: string;
  }[];
}

// API Service Class
class ApiService {
  // Projects API
  static async getProjects(): Promise<Project[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  }

  static async getFeaturedProjects(): Promise<Project[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/featured`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching featured projects:", error);
      throw error;
    }
  }

  static async getProjectById(id: string): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  }

  static async createProject(project: Omit<Project, "_id">): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(project),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  }

  // Skills API
  static async getSkills(): Promise<Skill[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/skills`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching skills:", error);
      throw error;
    }
  }

  // Code Display API
  static async getCodeDisplay(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/code-display`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching code display:", error);
      throw error;
    }
  }

  // Terminal Commands API
  static async getTerminalCommands(): Promise<{
    commands: string[];
    fallbackCommands: string[];
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/terminal-commands`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching terminal commands:", error);
      throw error;
    }
  }

  // Contact API
  static async submitContact(contactData: {
    name: string;
    email: string;
    message: string;
  }): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error submitting contact:", error);
      throw error;
    }
  }

  static async getContacts(adminToken: string): Promise<Contact[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts`, {
        headers: { "x-admin-token": adminToken },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching contacts:", error);
      throw error;
    }
  }

  // Footer API
  static async getFooter(): Promise<{
    copyright: string;
    navigationLinks: { name: string; href: string }[];
    socialLinks: { name: string; href: string; text: string }[];
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/footer`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching footer:", error);
      throw error;
    }
  }

  static async getProfile(): Promise<ProfileData> {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  }

  // Health Check API
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error checking health:", error);
      throw error;
    }
  }
}

export default ApiService;
