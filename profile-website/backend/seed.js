const mongoose = require("mongoose");

// Define Project schema inline for seeding
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  link: { type: String, required: true },
  featured: { type: Boolean, default: false },
  technologies: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

// Define Skills schema inline for seeding
const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: Number, required: true, min: 0, max: 100 },
  category: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Project = mongoose.model("Project", projectSchema);
const Skill = mongoose.model("Skill", skillSchema);

// Define Code Display schema inline for seeding
const codeDisplaySchema = new mongoose.Schema({
  codeLines: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now },
});

const CodeDisplay = mongoose.model("CodeDisplay", codeDisplaySchema);

// Define Terminal Commands schema inline for seeding
const terminalCommandsSchema = new mongoose.Schema({
  commands: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now },
});

const TerminalCommands = mongoose.model(
  "TerminalCommands",
  terminalCommandsSchema,
);

// Define Footer schema inline for seeding
const footerSchema = new mongoose.Schema({
  copyright: { type: String, required: true },
  navigationLinks: [
    {
      name: { type: String, required: true },
      href: { type: String, required: true },
    },
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

const Footer = mongoose.model("Footer", footerSchema);

// Hamed Afzali's CV Projects Data
const sampleProjects = [
  {
    title: "Core Banking System Modernization",
    description:
      "Led the complete modernization of legacy core banking systems using .NET microservices architecture, improving transaction processing by 40% and reducing system downtime by 60%.",
    category: "enterprise",
    image: "/core-banking-modernization.jpg",
    link: "https://github.com/hamed-afzali/core-banking-modernization",
    github: "https://github.com/hamed-afzali/core-banking-modernization",
    featured: true,
    technologies: [".NET", "C#", "IBM MQ", "SQL Server", "Docker"],
  },
  {
    title: "Distributed Payment Gateway",
    description:
      "Architected and implemented a high-availability payment processing system handling 10,000+ transactions per second with 99.99% uptime using distributed systems patterns.",
    category: "fintech",
    image: "/payment-gateway.jpg",
    link: "https://github.com/hamed-afzali/payment-gateway",
    github: "https://github.com/hamed-afzali/payment-gateway",
    featured: false,
    technologies: ["Node.js", "MongoDB", "Redis", "Docker", "Kubernetes"],
  },
  {
    title: "Cloud Migration Platform",
    description:
      "Developed an automated cloud migration platform that successfully migrated 50+ enterprise applications to AWS with zero downtime and 99.8% data integrity.",
    category: "cloud",
    image: "/cloud-migration.jpg",
    link: "https://github.com/hamed-afzali/cloud-migration-platform",
    github: "https://github.com/hamed-afzali/cloud-migration-platform",
    featured: false,
    technologies: ["AWS", "Azure", "Terraform", "Ansible", "Docker"],
  },
  {
    title: "Real-time Analytics Dashboard",
    description:
      "Built a comprehensive real-time analytics dashboard processing 1M+ events per second using Apache Kafka and React for financial trading platforms.",
    category: "data",
    image: "/analytics-dashboard.jpg",
    link: "https://github.com/hamed-afzali/analytics-dashboard",
    github: "https://github.com/hamed-afzali/analytics-dashboard",
    featured: false,
    technologies: [
      "React",
      "Node.js",
      "Apache Kafka",
      "PostgreSQL",
      "WebSocket",
    ],
  },
  {
    title: "Mobile Banking Application",
    description:
      "Led the development of a cross-platform mobile banking application serving 500K+ users with React Native and Flutter for iOS and Android platforms.",
    category: "mobile",
    image: "/mobile-banking.jpg",
    link: "https://github.com/hamed-afzali/mobile-banking-app",
    github: "https://github.com/hamed-afzali/mobile-banking-app",
    featured: false,
    technologies: [
      "React Native",
      "Flutter",
      "Node.js",
      "Firebase",
      "TypeScript",
    ],
  },
  {
    title: "API Gateway Architecture",
    description:
      "Designed and implemented a centralized API gateway handling 100M+ daily API calls with rate limiting, authentication, and comprehensive monitoring.",
    category: "architecture",
    image: "/api-gateway.jpg",
    link: "https://github.com/hamed-afzali/api-gateway",
    github: "https://github.com/hamed-afzali/api-gateway",
    featured: false,
    technologies: ["Kong", "Express.js", "Redis", "Prometheus", "Grafana"],
  },
  {
    title: "Hardware-Software Printer Integration",
    description:
      "Engineered high-reliability interprocess communication (IPC) using Named Pipes and socket-based networking for complex hardware-software printer integrations.",
    category: "Systems Integration",
    image: "/printer-integration.jpg",
    link: "https://github.com/hamed-afzali/printer-integration",
    github: "https://github.com/hamed-afzali/printer-integration",
    featured: true,
    technologies: [
      "Named Pipes",
      "Socket Programming",
      "C++",
      "Hardware Integration",
      "IPC",
    ],
  },
  {
    title: "Chakavak National Cheque Clearing System",
    description:
      "Architected an IBM MQ-based messaging backbone for the national cheque clearing system, ensuring fault-tolerant, asynchronous processing across distributed nodes.",
    category: "FinTech & Distributed Infrastructure",
    image: "/chakavak-system.jpg",
    link: "https://github.com/hamed-afzali/chakavak-cheque-clearing",
    github: "https://github.com/hamed-afzali/chakavak-cheque-clearing",
    featured: false,
    technologies: [
      "IBM MQ",
      "Distributed Messaging",
      "Fault Tolerance",
      "Asynchronous Processing",
      "Banking Systems",
    ],
  },
  {
    title: "Amitis Hamta Payment Panel",
    description:
      "Designed a secure, responsive payment dashboard and website using ReactJS, Node.js, and MongoDB for financial transaction management.",
    category: "Web & Cloud Platforms",
    image: "/payment-panel.jpg",
    link: "https://github.com/hamed-afzali/amitis-payment-panel",
    github: "https://github.com/hamed-afzali/amitis-payment-panel",
    featured: false,
    technologies: [
      "ReactJS",
      "Node.js",
      "MongoDB",
      "Payment Systems",
      "Dashboard Design",
    ],
  },
  {
    title: "POS Management Application",
    description:
      "Built a terminal management suite using VB.NET Core and WPF focused on hardware-software integration for payment terminals.",
    category: "Enterprise & Mobile Solutions",
    image: "/pos-management.jpg",
    link: "https://github.com/hamed-afzali/pos-management",
    github: "https://github.com/hamed-afzali/pos-management",
    featured: false,
    technologies: [
      "VB.NET Core",
      "WPF",
      "POS Systems",
      "Hardware Integration",
      "Payment Terminals",
    ],
  },
  {
    title: "Budget & Reporting Web Apps",
    description:
      "Orchestrated containerized reporting tools using Docker, ReactJS, Node.js, and SQL Server for enterprise financial reporting.",
    category: "Web & Cloud Platforms",
    image: "/budget-reporting.jpg",
    link: "https://github.com/hamed-afzali/budget-reporting-apps",
    github: "https://github.com/hamed-afzali/budget-reporting-apps",
    featured: false,
    technologies: [
      "Docker",
      "ReactJS",
      "Node.js",
      "SQL Server",
      "Containerization",
      "Financial Reporting",
    ],
  },
  {
    title: "Reporting Mobile App",
    description:
      "Developed a cross-platform data visualization tool for banking metrics using React Native and Node.js.",
    category: "Enterprise & Mobile Solutions",
    image: "/reporting-mobile.jpg",
    link: "https://github.com/hamed-afzali/reporting-mobile-app",
    github: "https://github.com/hamed-afzali/reporting-mobile-app",
    featured: false,
    technologies: [
      "React Native",
      "Node.js",
      "Data Visualization",
      "Cross-Platform",
      "Mobile Development",
    ],
  },
  {
    title: "SHETAB Banking Reporting System",
    description:
      "Engineered a high-throughput reporting engine using IBM MQ and SQL Server to reconcile national-scale card transactions for Iran's national banking network.",
    category: "FinTech & Distributed Infrastructure",
    image: "/shetab-banking.jpg",
    link: "https://github.com/hamed-afzali/shetab-banking-reporting",
    github: "https://github.com/hamed-afzali/shetab-banking-reporting",
    featured: true,
    technologies: [
      "IBM MQ",
      "SQL Server",
      ".NET",
      "Distributed Systems",
      "High-Throughput",
    ],
  },
];

// Hamed Afzali's Skills Data
const sampleSkills = [
  {
    name: ".NET & C#",
    level: 95,
    category: "backend",
    description:
      "Expert in .NET Framework, .NET Core, and C# programming with 15+ years of enterprise experience",
  },
  {
    name: "Distributed Systems",
    level: 90,
    category: "architecture",
    description:
      "Experience with microservices, message queues, IBM MQ, and distributed computing patterns",
  },
  {
    name: "React & TypeScript",
    level: 85,
    category: "frontend",
    description:
      "Modern React development with TypeScript, hooks, and ecosystem management",
  },
  {
    name: "Cloud Architecture",
    level: 88,
    category: "cloud",
    description:
      "AWS, Azure, Docker, Kubernetes, and cloud-native architecture patterns",
  },
  {
    name: "Database Design",
    level: 92,
    category: "database",
    description:
      "SQL Server, MongoDB, PostgreSQL, data modeling, and performance optimization",
  },
  {
    name: "System Integration",
    level: 87,
    category: "integration",
    description:
      "API design, RESTful services, system integration, and enterprise connectivity",
  },
];

// Hamed Afzali's Code Display Data
const codeDisplayData = {
  codeLines: [
    "const developer = {",
    "  name: 'Hamed Afzali',",
    "  title: 'Senior Full-Stack Engineer',",
    "  experience: '15+ years',",
    "  location: 'Tübingen, Germany',",
    "  expertise: [",
    "    'Distributed Systems Architecture',",
    "    'High-Performance Computing',",
    "    'Enterprise Software Development',",
    "    'Cloud-Native Solutions',",
    "    'Core Banking Systems',",
    "    'Microservices & APIs'",
    "  ],",
    "  technologies: {",
    "    backend: ['.NET', 'C#', 'Node.js', 'IBM MQ'],",
    "    frontend: ['React', 'TypeScript', 'Angular'],",
    "    database: ['SQL Server', 'MongoDB', 'PostgreSQL'],",
    "    cloud: ['AWS', 'Azure', 'Docker', 'Kubernetes'],",
    "    methodologies: ['SAFe Agile', 'TDD', 'CI/CD']",
    "  },",
    "  achievements: {",
    "    enterpriseProjects: '50+',",
    "    teamLeadership: '10+ years',",
    "    systemModernizations: '15+ successful migrations',",
    "    performanceOptimizations: '40% avg improvement'",
    "  },",
    "  status: 'Open to new challenges'",
    "};",
  ],
};

// Hamed Afzali's Terminal Commands Data
const terminalCommandsData = {
  commands: [
    "$ whoami",
    "$ grep -r 'experience' /career/ --include='*.md'",
    "$ curl -X POST https://api.hamed.dev/contact",
    "$ echo 'Ready for new challenges'",
  ],
  fallbackCommands: [
    "$ whoami",
    "$ grep -r 'experience' /career/ --include='*.md'",
    "$ curl -X POST https://api.hamed.dev/contact",
    "$ echo 'Ready for new challenges'",
  ],
};

// Hamed Afzali's Footer Data
const footerData = {
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
};

// Seed function
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    );

    // Clear existing projects
    await Project.deleteMany({});
    console.log("Cleared existing projects");

    // Clear existing skills
    await Skill.deleteMany({});
    console.log("Cleared existing skills");

    // Clear existing code display
    await CodeDisplay.deleteMany({});
    console.log("Cleared existing code display");

    // Clear existing terminal commands
    await TerminalCommands.deleteMany({});
    console.log("Cleared existing terminal commands");

    // Clear existing footer
    await Footer.deleteMany({});
    console.log("Cleared existing footer");

    // Insert sample projects
    const insertedProjects = await Project.insertMany(sampleProjects);
    console.log(`Inserted ${insertedProjects.length} projects`);

    // Insert sample skills
    const insertedSkills = await Skill.insertMany(sampleSkills);
    console.log(`Inserted ${insertedSkills.length} skills`);

    // Insert code display data
    const insertedCodeDisplay = await CodeDisplay.insertMany([codeDisplayData]);
    console.log(`Inserted ${insertedCodeDisplay.length} code display entries`);

    // Insert terminal commands data
    const insertedTerminalCommands = await TerminalCommands.insertMany([
      terminalCommandsData,
    ]);
    console.log(
      `Inserted ${insertedTerminalCommands.length} terminal commands entries`,
    );

    // Insert footer data
    const insertedFooter = await Footer.insertMany([footerData]);
    console.log(`Inserted ${insertedFooter.length} footer entries`);

    // Disconnect from database
    await mongoose.disconnect();
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run seed function
seedDatabase();
