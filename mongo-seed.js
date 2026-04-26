db = db.getSiblingDB("portfolio");

const fs = require("fs");
const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));

const projects =
  readJson("/seed/data/portfolio-projects.json").projects || [];
const skills = readJson("/seed/data/skills.json").skills || [];
const terminal = readJson("/seed/data/terminal-commands.json");
const footer = readJson("/seed/data/footer-data.json").footerData || {};
const profile = readJson("/seed/data/profile-data.json").profile || {};
const codeDisplay =
  readJson("/seed/data/code-display.json").codeDisplay || {};

db.projects.deleteMany({});
db.skills.deleteMany({});
db.terminalcommands.deleteMany({});
db.footer.deleteMany({});
db.profile.deleteMany({});
db.codedisplays.deleteMany({});

if (projects.length) {
  db.projects.insertMany(projects);
}

if (skills.length) {
  db.skills.insertMany(skills);
}

db.terminalcommands.insertOne({
  commands: terminal.terminalCommands || [],
  fallbackCommands:
    terminal.fallbackCommands || terminal.terminalCommands || [],
  createdAt: new Date(),
});

db.footer.insertOne({
  copyright: footer.copyright || "",
  navigationLinks: footer.navigationLinks || [],
  socialLinks: footer.socialLinks || [],
  createdAt: new Date(),
});

db.profile.insertOne({
  ...profile,
  createdAt: new Date(),
});

if (codeDisplay.codeLines && codeDisplay.codeLines.length) {
  db.codedisplays.insertOne({
    codeLines: codeDisplay.codeLines,
    createdAt: new Date(),
  });
}

printjson({
  projects: db.projects.countDocuments(),
  skills: db.skills.countDocuments(),
  terminalcommands: db.terminalcommands.countDocuments(),
  footer: db.footer.countDocuments(),
  profile: db.profile.countDocuments(),
  codedisplays: db.codedisplays.countDocuments(),
});
