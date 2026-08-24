const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  link: { type: String, required: true },
  featured: { type: Boolean, default: false },
  technologies: [{ type: String }],
  status: { type: String },
  duration: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: Number, required: true, min: 0, max: 100 },
  category: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const codeDisplaySchema = new mongoose.Schema({
  codeLines: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now },
});

const terminalCommandsSchema = new mongoose.Schema({
  commands: [{ type: String, required: true }],
  fallbackCommands: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

const footerSchema = new mongoose.Schema({
  copyright: { type: String, required: true },
  navigationLinks: [
    { name: { type: String, required: true }, href: { type: String, required: true } },
  ],
  socialLinks: [
    {
      name: { type: String, required: true },
      href: { type: String, required: true },
      text: { type: String, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const profileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  siteUrl: { type: String, required: true },
  image: { type: String, required: true },
  headline: { type: String, required: true },
  summary: { type: String, required: true },
  location: { type: String, required: true },
  availabilityStatus: { type: String, required: true },
  yearsExperience: { type: String, required: true },
  roles: [{ type: String }],
  specializations: [{ type: String }],
  contactMethods: [
    {
      label: { type: String, required: true },
      value: { type: String, required: true },
      href: { type: String, required: true },
      command: { type: String, required: true },
    },
  ],
  careerHighlights: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Project = mongoose.model("Project", projectSchema);
const Skill = mongoose.model("Skill", skillSchema);
const CodeDisplay = mongoose.model("CodeDisplay", codeDisplaySchema);
const TerminalCommands = mongoose.model("TerminalCommands", terminalCommandsSchema);
const Footer = mongoose.model("Footer", footerSchema);
const Profile = mongoose.model("Profile", profileSchema, "profile");

// ─── Projects ────────────────────────────────────────────────────────────────

const sampleProjects = [
  {
    title: "GMG SaaS Platform Modernization",
    description:
      "Contributed to the architecture decision and led execution of the migration of mission-critical multi-tenant SaaS software from .NET Framework to .NET 8, including SQL CE to SQLite data storage migration. Kept the production platform stable throughout the transition.",
    category: "enterprise",
    image: "/core-banking-modernization.jpg",
    link: "#",
    featured: true,
    technologies: [".NET 8", "C#", "SQLite", "Azure DevOps", "Docker", "SAFe Agile"],
    status: "Active",
    duration: "2022 – Present",
  },
  {
    title: "Printer Hardware IPC Integration",
    description:
      "Designed and built the full IPC layer between SaaS software and professional printer hardware, choosing Named Pipes and socket networking as the communication approach at GMG — enabling reliable real-time hardware-software communication and eliminating race conditions.",
    category: "integration",
    image: "/printer-integration.jpg",
    link: "#",
    featured: true,
    technologies: ["Named Pipes", "Socket Networking", "C#", ".NET 8", "IPC", "Hardware Integration"],
    status: "Active",
    duration: "2022 – Present",
  },
  {
    title: "Multi-Tenant Authorization Platform",
    description:
      "Architected RESTful APIs with OAuth2 and JWT authentication, and implemented fine-grained multi-tenant authorization using Authzed (Google Zanzibar-inspired) at GMG — supporting complex cross-tenant permission models.",
    category: "cloud",
    image: "/api-gateway.jpg",
    link: "#",
    featured: true,
    technologies: ["REST", "OAuth2", "JWT", "Authzed", "Google Zanzibar", ".NET 8", "Multi-Tenant"],
    status: "Active",
    duration: "2022 – Present",
  },
  {
    title: "MCP Server with RAG-Indexed Codebase",
    description:
      "Built an MCP (Model Context Protocol) server with RAG-indexed codebase routes for AI-assisted development at GMG — making it easier for engineers to navigate complex legacy code and accelerating team onboarding.",
    category: "enterprise",
    image: "/mcp-server.jpg",
    link: "#",
    featured: true,
    technologies: ["MCP", "RAG", "AI Integration", "Node.js", "Codebase Indexing", "Developer Tooling"],
    status: "Active",
    duration: "2024 – Present",
  },
  {
    title: "OSS Licence Detection & Compliance Automation",
    description:
      "Solely designed and built an automated OSS licence-compliance tool at GMG covering 3 applications and their transitive dependencies (57+ NuGet packages in the main app alone). Validates every package against approved licence policy, auto-generates copyright notices, an acknowledgement file, and an SBOM, and is wired into the CI pipeline to block any unreviewed package from shipping — eliminating manual legal review.",
    category: "cloud",
    image: "/cloud-migration.jpg",
    link: "#",
    featured: false,
    technologies: ["Node.js", "Automation", "Dependency Analysis", "Compliance", "CI/CD", "Azure DevOps"],
    status: "Completed",
    duration: "2023",
  },
  {
    title: "Enterprise Analytics & Regulatory Reporting Platform",
    description:
      "Sole architect and technical lead of a regulatory-grade BI platform (React.js, Node.js, Docker, microservices) aggregating real-time transaction data from 400+ branches, ATM, POS, and core banking at Postbank of Iran (PBI). Extended the platform with a structured API layer for external BI tools and a React Native companion app for on-the-go branch-level reporting. Used by senior management and submitted to Central Bank regulators.",
    category: "fintech",
    image: "/analytics-dashboard.jpg",
    link: "#",
    featured: true,
    technologies: ["React.js", "Node.js", "SQL Server", "ETL", "Docker", "Microservices", "Regulatory Reporting"],
    status: "Completed",
    duration: "2018 – 2022",
  },
  {
    title: "Banking ETL & Regulatory Data Pipelines",
    description:
      "Designed custom Node.js and SQL Server ETL pipelines processing high-volume transactional data from multiple banking sources at PBI. Enforced strict data validation where inaccuracies carried direct legal and financial consequences.",
    category: "fintech",
    image: "/budget-reporting.jpg",
    link: "#",
    featured: false,
    technologies: ["Node.js", "SQL Server", "ETL", "Data Validation", "BI Integration", "Regulatory Compliance"],
    status: "Completed",
    duration: "2018 – 2022",
  },
  {
    title: "Amitis Hamta FinTech Platform",
    description:
      "Software architecture consultant for Amitis Hamta Co. — strategic guidance on full-stack architecture and building a secure payment panel integration for their fintech platform.",
    category: "fintech",
    image: "/payment-panel.jpg",
    link: "#",
    featured: false,
    technologies: ["ReactJS", "Node.js", "MongoDB", "Payment Systems", "Architecture Consulting"],
    status: "Completed",
    duration: "2019 – 2022",
  },
  {
    title: "Shetab National Card Network Integration",
    description:
      "Spearheaded R&D and architecture for the Shetab national card network integration at PBI — Java-based high-availability services for real-time national payment transaction processing at scale.",
    category: "fintech",
    image: "/shetab-banking.jpg",
    link: "#",
    featured: true,
    technologies: ["Java", "Distributed Systems", "High Availability", "Real-Time Processing", "National Payments"],
    status: "Completed",
    duration: "2009 – 2018",
  },
  {
    title: "Chakavak National Cheque-Clearing Backbone",
    description:
      "Architected the IBM MQ messaging backbone for PBI's Chakavak national cheque-clearing system — fault-tolerant asynchronous processing across distributed nodes under strict Central Bank regulatory SLAs.",
    category: "fintech",
    image: "/chakavak-system.jpg",
    link: "#",
    featured: true,
    technologies: ["IBM MQ", "Event-Driven Architecture", "Distributed Messaging", "Fault Tolerance", "Async Processing"],
    status: "Completed",
    duration: "2009 – 2018",
  },
  {
    title: "Core Banking Platform — 15,000 Concurrent Users",
    description:
      "Architected and delivered a full-scope core banking platform (.NET, C#) spanning Accounting, Treasury, HR, Branch Operations, and Supervisor workflows — 15-node distributed SQL Server cluster serving 15,000 concurrent users with ACID-compliant transactional isolation.",
    category: "enterprise",
    image: "/core-banking-modernization.jpg",
    link: "#",
    featured: true,
    technologies: [".NET", "C#", "SQL Server", "NHibernate", "Distributed Database", "ACID Transactions", "15-Node Cluster"],
    status: "Completed",
    duration: "2009 – 2018",
  },
  {
    title: "POS Terminal & ATM Integration Software",
    description:
      "Developed C++ POS terminal software with hardware-level protocol integration, and ATM/card processing modules with real-time authorisation and settlement flows at PBI.",
    category: "integration",
    image: "/pos-management.jpg",
    link: "#",
    featured: false,
    technologies: ["C++", "C#", "POS Systems", "ATM Integration", "Hardware Protocols", "Real-Time Settlement"],
    status: "Completed",
    duration: "2009 – 2018",
  },
];

// ─── Skills ──────────────────────────────────────────────────────────────────

const sampleSkills = [
  {
    name: ".NET Architecture",
    level: 96,
    category: "backend",
    description:
      "Deep experience across .NET Framework and .NET 8 for large regulated systems. Led migration from .NET Framework to .NET 8 at GMG, resolving complex legacy constraints while keeping production stable. Applies SOLID principles, object-oriented analysis and design (OOA/OOD), and test-driven development (TDD) throughout.",
  },
  {
    name: "Distributed Systems",
    level: 94,
    category: "architecture",
    description:
      "Architected mission-critical platforms at national scale: 15-node SQL Server cluster for 15,000 concurrent users, Shetab card network services, and Chakavak cheque-clearing backbone.",
  },
  {
    name: "SQL Server, MongoDB & Data Engineering",
    level: 94,
    category: "database",
    description:
      "Designed banking-grade SQL Server schemas and MongoDB data models, high-volume ETL pipelines, NHibernate ORM layers, advanced indexing, and ACID-compliant persistence for financial systems under strict regulatory SLAs.",
  },
  {
    name: "Azure DevOps & CI/CD",
    level: 91,
    category: "cloud",
    description:
      "Contributes to CI/CD strategy and owns pipeline setup, release workflows, build automation, and containerized delivery using Azure DevOps and Docker across multi-environment deployments at GMG.",
  },
  {
    name: "System Integration & IPC",
    level: 91,
    category: "integration",
    description:
      "Built the IPC layer between software and printer hardware using Named Pipes and socket networking. Extensive integration across banking hardware (POS, ATM), IBM MQ, and external BI systems.",
  },
  {
    name: "React, Redux & TypeScript",
    level: 89,
    category: "frontend",
    description:
      "Builds modular SaaS frontend features at GMG using React, Redux, and TypeScript, and delivered the full React.js reporting dashboard for PBI's 400+ branch analytics platform.",
  },
  {
    name: "Team Leadership",
    level: 89,
    category: "leadership",
    description:
      "Led an 8-person cross-functional engineering team for 9 years at PBI. Owns sprint planning, code quality, mentoring, and hiring in SAFe Agile at GMG.",
  },
  {
    name: "Event-Driven Architecture",
    level: 88,
    category: "architecture",
    description:
      "Owned IBM MQ architecture for the Chakavak national cheque-clearing system achieving fault-tolerant async processing under regulatory SLAs. Deep background in event-driven design patterns.",
  },
  {
    name: "Node.js & Microservices",
    level: 87,
    category: "backend",
    description:
      "Designed and operated microservices-based analytics platforms and ETL services at PBI. Built MCP servers, automation tools, and API layers with Node.js at GMG.",
  },
  {
    name: "Security & Authorization",
    level: 86,
    category: "security",
    description:
      "Architected OAuth2, JWT, and fine-grained multi-tenant authorization with Authzed (Google Zanzibar-inspired) at GMG. Extensive background in regulated financial security requirements.",
  },
  {
    name: "Cloud Operations",
    level: 86,
    category: "cloud",
    description:
      "Hands-on with AWS CloudWatch, Docker-based production operations, and self-hosted SaaS deployments on-premises. Owned full infrastructure and production operations at PBI.",
  },
  {
    name: "Quality Engineering",
    level: 84,
    category: "quality",
    description:
      "Built and maintained unit, integration, and Cypress E2E test suites at GMG. Contributed to early AWS CloudWatch monitoring setup to establish baseline observability. Experience with disciplined delivery in both regulated banking and commercial SaaS contexts.",
  },
];

// ─── Code Display ─────────────────────────────────────────────────────────────

const codeDisplayData = {
  codeLines: [
    "const developer = {",
    "  name: 'Hamed Afzali',",
    "  title: 'Senior Full-Stack Engineer',",
    "  experience: '20+ years',",
    "  location: 'Tübingen, Germany',",
    "  current: 'GMG GmbH & Co. KG',",
    "  expertise: [",
    "    'Distributed Systems Architecture',",
    "    'Platform Modernization (.NET → .NET 8)',",
    "    'Event-Driven Architecture & IBM MQ',",
    "    'Multi-Tenant SaaS Platforms',",
    "    'National Payment Infrastructure',",
    "    'Technical Team Leadership'",
    "  ],",
    "  stack: {",
    "    backend: ['.NET 8', 'C#', 'Node.js', 'Java', 'IBM MQ'],",
    "    frontend: ['React', 'Redux', 'TypeScript'],",
    "    database: ['SQL Server', 'SQLite', 'MongoDB'],",
    "    cloud: ['AWS', 'Azure DevOps', 'Docker', 'CI/CD'],",
    "    auth: ['OAuth2', 'JWT', 'Authzed']",
    "  },",
    "  scale: {",
    "    concurrentUsers: '15000+',",
    "    branches: '400+',",
    "    teamSize: '8 engineers',",
    "    yearsLeading: '9'",
    "  },",
    "  status: 'Open to senior engineering & architecture roles'",
    "};",
  ],
};

// ─── Terminal Commands ────────────────────────────────────────────────────────

const terminalCommandsData = {
  commands: [
    "$ whoami → hamed.afzali @ senior-engineer",
    "$ cat /career/current.txt → GMG GmbH | Senior Full-Stack Engineer | Tübingen, DE",
    "$ ls /skills/ → .net8  react  typescript  distributed-systems  node.js  azure-devops",
    "$ git log --oneline | wc -l → 20 years of commits",
    "$ curl -X POST https://hamed.dev/api/contact",
    "$ echo 'Open to senior engineering & architecture roles'",
  ],
  fallbackCommands: [
    "$ whoami → hamed.afzali @ senior-engineer",
    "$ cat /career/current.txt → GMG GmbH | Senior Full-Stack Engineer | Tübingen, DE",
    "$ ls /skills/ → .net8  react  typescript  distributed-systems  node.js  azure-devops",
    "$ git log --oneline | wc -l → 20 years of commits",
    "$ curl -X POST https://hamed.dev/api/contact",
    "$ echo 'Open to senior engineering & architecture roles'",
  ],
};

// ─── Footer ───────────────────────────────────────────────────────────────────

const footerData = {
  copyright: "Hamed Afzali. All rights reserved.",
  navigationLinks: [
    { name: "about", href: "#about" },
    { name: "portfolio", href: "#portfolio" },
    { name: "contact", href: "#contact" },
  ],
  socialLinks: [
    { name: "linkedin", href: "https://linkedin.com/in/hamed-afzali", text: "LinkedIn" },
    { name: "github", href: "https://github.com/hamedafzali", text: "GitHub" },
    { name: "email", href: "mailto:afzali.hamed@gmail.com", text: "Email" },
  ],
};

// ─── Profile ──────────────────────────────────────────────────────────────────

const profileData = {
  name: "Hamed Afzali",
  brand: "hamed.dev",
  siteUrl: "https://hamed.dev",
  image: "https://hamed.dev/hamedafzali.png",
  headline: "Senior Full-Stack Engineer & Technical Lead",
  summary:
    "Senior engineer and technical lead with 20+ years designing and operating mission-critical distributed systems in regulated banking and fintech environments. Track record of owning full system lifecycles — from architecture decisions and team leadership to production operations — at scale (15,000+ concurrent users, 400+ branch networks, national payment infrastructure). Specializes in platform modernization, high-availability distributed architecture, and leading cross-functional engineering teams toward measurable business outcomes.",
  location: "Tübingen, Germany",
  availabilityStatus: "Open to senior engineering, architecture, and technical leadership roles",
  yearsExperience: "20+",
  roles: [
    "Senior Full-Stack Engineer",
    "Distributed Systems Architect",
    "Technical Team Lead",
    "Platform Modernization Lead",
  ],
  specializations: [
    "Distributed Systems",
    "Platform Modernization",
    "FinTech & Banking Systems",
    "Technical Leadership",
  ],
  contactMethods: [
    {
      label: "Email",
      value: "afzali.hamed@gmail.com",
      href: "mailto:afzali.hamed@gmail.com",
      command: "mail afzali.hamed@gmail.com",
    },
    {
      label: "Phone",
      value: "+49 176 3146 1176",
      href: "tel:+4917631461176",
      command: "call +4917631461176",
    },
    {
      label: "LinkedIn",
      value: "linkedin.com/in/hamed-afzali",
      href: "https://linkedin.com/in/hamed-afzali",
      command: "open https://linkedin.com/in/hamed-afzali",
    },
    {
      label: "Location",
      value: "Tübingen, Germany",
      href: "#contact",
      command: "map Tübingen, Germany",
    },
  ],
  careerHighlights: [
    {
      title: "15,000+ Concurrent Users",
      description:
        "Architected a 15-node distributed SQL Server core banking platform serving 15,000 concurrent users with ACID-compliant transactional isolation at Postbank of Iran (PBI).",
    },
    {
      title: "National Payment Infrastructure",
      description:
        "Designed and delivered high-availability Java services for the Shetab national card network and the IBM MQ backbone for the Chakavak national cheque-clearing system.",
    },
    {
      title: "400+ Branch Analytics Platform",
      description:
        "Sole architect and technical lead of a regulatory-grade BI and reporting platform consolidating real-time transaction data from 400+ branches, submitted to the Central Bank.",
    },
    {
      title: "Team Lead — 8 Engineers",
      description:
        "Led a cross-functional engineering team of 8 for 9 years at PBI, owning delivery, sprint planning, code quality, and technical mentorship across mission-critical projects.",
    },
  ],
};

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seedDatabase() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio",
      { useNewUrlParser: true, useUnifiedTopology: true },
    );

    await Promise.all([
      Project.deleteMany({}),
      Skill.deleteMany({}),
      CodeDisplay.deleteMany({}),
      TerminalCommands.deleteMany({}),
      Footer.deleteMany({}),
      Profile.deleteMany({}),
    ]);

    const [projects, skills, codeDisplay, terminal, footer, profile] =
      await Promise.all([
        Project.insertMany(sampleProjects),
        Skill.insertMany(sampleSkills),
        CodeDisplay.insertMany([codeDisplayData]),
        TerminalCommands.insertMany([terminalCommandsData]),
        Footer.insertMany([footerData]),
        Profile.insertMany([profileData]),
      ]);

    console.log(`Projects:          ${projects.length}`);
    console.log(`Skills:            ${skills.length}`);
    console.log(`Code display:      ${codeDisplay.length}`);
    console.log(`Terminal commands: ${terminal.length}`);
    console.log(`Footer:            ${footer.length}`);
    console.log(`Profile:           ${profile.length}`);
    console.log("Database seeded successfully.");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
