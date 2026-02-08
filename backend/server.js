console.log("=== SERVER.JS STARTING ===");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

console.log("Dependencies loaded");

const app = express();
const PORT = process.env.PORT || 5001;

console.log("App created, PORT:", PORT);

// Disable Express security headers that cause CSP issues
app.disable("x-powered-by");
app.set("trust proxy", 1);

// Remove security headers middleware
app.use((req, res, next) => {
  // Remove all security headers that Express sets
  res.removeHeader("Content-Security-Policy");
  res.removeHeader("X-Content-Type-Options");
  res.removeHeader("X-Frame-Options");
  res.removeHeader("X-XSS-Protection");
  res.removeHeader("Strict-Transport-Security");
  res.removeHeader("Referrer-Policy");
  res.removeHeader("Cross-Origin-Opener-Policy");
  res.removeHeader("Cross-Origin-Resource-Policy");
  res.removeHeader("Origin-Agent-Cluster");
  res.removeHeader("X-DNS-Prefetch-Control");
  res.removeHeader("X-Download-Options");
  res.removeHeader("X-Permitted-Cross-Domain-Policies");

  // Set permissive headers
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: http: ws: wss: chrome-extension://*; script-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: http: chrome-extension://*; style-src 'self' 'unsafe-inline' data: blob: https: http:; img-src 'self' data: blob: https: http:; font-src 'self' data: blob: https: http:; connect-src 'self' ws: wss: data: blob: https: http: chrome-extension://*; object-src 'none';",
  );
  res.setHeader("X-Content-Type-Options", "nosniff");

  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Set less restrictive CSP for development
app.use((req, res, next) => {
  console.log("CSP middleware executing for:", req.url);
  // Remove any existing CSP headers first
  res.removeHeader("Content-Security-Policy");
  res.removeHeader("content-security-policy");

  // Set new CSP header
  const cspHeader =
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: http: ws: wss: chrome-extension://*; script-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: http: chrome-extension://*; style-src 'self' 'unsafe-inline' data: blob: https: http:; img-src 'self' data: blob: https: http:; font-src 'self' data: blob: https: http:; connect-src 'self' ws: wss: data: blob: https: http: chrome-extension://*; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';";
  res.setHeader("Content-Security-Policy", cspHeader);
  console.log("CSP header set to:", cspHeader.substring(0, 100) + "...");
  next();
});

// Response interceptor to ensure CSP is set
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (data) {
    // Remove any CSP headers that might have been set later
    res.removeHeader("Content-Security-Policy");
    res.removeHeader("content-security-policy");

    // Set our CSP header
    const cspHeader =
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: http: ws: wss: chrome-extension://*; script-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: http: chrome-extension://*; style-src 'self' 'unsafe-inline' data: blob: https: http:; img-src 'self' data: blob: https: http:; font-src 'self' data: blob: https: http:; connect-src 'self' ws: wss: data: blob: https: http: chrome-extension://*; object-src 'none';";
    res.setHeader("Content-Security-Policy", cspHeader);
    console.log("Response CSP header set");

    originalSend.call(this, data);
  };
  next();
});

// Serve static files from the React app build directory
const frontendBuildPath = (() => {
  const localPath = path.join(__dirname, "..", "frontend", "build");
  const dockerPath = path.join(__dirname, "frontend", "build");
  if (fs.existsSync(localPath)) return localPath;
  if (fs.existsSync(dockerPath)) return dockerPath;
  return localPath;
})();
app.use(express.static(frontendBuildPath));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Project Schema
const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  github: {
    type: String,
  },
  technologies: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Project = mongoose.model("Project", projectSchema);

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Contact = mongoose.model("Contact", contactSchema);

// Skill Schema
const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  level: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Skill = mongoose.model("Skill", skillSchema);

// Code Display Schema
const codeDisplaySchema = new mongoose.Schema({
  codeLines: [
    {
      type: String,
      required: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CodeDisplay = mongoose.model("CodeDisplay", codeDisplaySchema);

// Terminal Commands Schema
const terminalCommandsSchema = new mongoose.Schema({
  commands: [
    {
      type: String,
      required: true,
    },
  ],
  fallbackCommands: [
    {
      type: String,
      required: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TerminalCommands = mongoose.model(
  "TerminalCommands",
  terminalCommandsSchema,
);

// Footer Schema
const footerSchema = new mongoose.Schema({
  copyright: {
    type: String,
    required: true,
  },
  navigationLinks: [
    {
      name: {
        type: String,
        required: true,
      },
      href: {
        type: String,
        required: true,
      },
    },
  ],
  socialLinks: [
    {
      name: {
        type: String,
        required: true,
      },
      href: {
        type: String,
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Footer = mongoose.model("Footer", footerSchema);

// Routes
// Get all projects
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get featured projects
app.get("/api/projects/featured", async (req, res) => {
  try {
    const projects = await Project.find({ featured: true }).sort({
      createdAt: -1,
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single project
app.get("/api/projects/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new project
app.post("/api/projects", async (req, res) => {
  try {
    const project = new Project(req.body);
    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Submit contact form
app.post("/api/contact", async (req, res) => {
  try {
    const contact = new Contact(req.body);
    const savedContact = await contact.save();
    res.status(201).json({ message: "Contact form submitted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all contacts (admin functionality)
app.get("/api/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get skills for About page
app.get("/api/skills", async (req, res) => {
  try {
    // Fetch skills from database
    const skills = await Skill.find().sort({ name: 1 });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get code display for About page
app.get("/api/code-display", async (req, res) => {
  try {
    // Fetch code display from database
    const codeDisplay = await CodeDisplay.findOne().sort({ createdAt: -1 });
    if (codeDisplay) {
      res.json(codeDisplay.codeLines);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get terminal commands for Contact page
app.get("/api/terminal-commands", async (req, res) => {
  try {
    // Fetch terminal commands from database
    const terminalCommands = await TerminalCommands.findOne().sort({
      createdAt: -1,
    });
    if (terminalCommands) {
      res.json({
        commands: terminalCommands.commands,
        fallbackCommands:
          terminalCommands.fallbackCommands || terminalCommands.commands,
      });
    } else {
      res.json({
        commands: [],
        fallbackCommands: [
          "$ whoami",
          "$ grep -r 'experience' /career/ --include='*.md'",
          "$ curl -X POST https://api.hamed.dev/contact",
          "$ echo 'Ready for new challenges'",
        ],
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get footer data for Footer component
app.get("/api/footer", async (req, res) => {
  try {
    // Fetch footer data from database
    const footer = await Footer.findOne().sort({ createdAt: -1 });
    if (footer) {
      res.json(footer);
    } else {
      res.json({
        copyright: "Profile. All rights reserved.",
        navigationLinks: [
          { name: "about", href: "#about" },
          { name: "portfolio", href: "#portfolio" },
          { name: "contact", href: "#contact" },
        ],
        socialLinks: [
          { name: "twitter", href: "https://twitter.com", text: "Twitter" },
          { name: "linkedin", href: "https://linkedin.com", text: "LinkedIn" },
          { name: "github", href: "https://github.com", text: "GitHub" },
        ],
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Serve React app for non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendBuildPath, "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
