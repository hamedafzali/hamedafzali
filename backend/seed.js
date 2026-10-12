// Seeds the content collections from data/*.json, the single source of truth
// for portfolio content. The server calls seedContent() on every start, so a
// deploy is enough to publish content changes. The Docker image carries its
// own copy of data/ (SEED_DATA_DIR) instead of reading it from a bind mount.
// Manual usage: MONGODB_URI=... node seed.js
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const DATA_DIR =
  process.env.SEED_DATA_DIR || path.resolve(__dirname, "..", "data");

const readJson = (file) =>
  JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));

// Replaces every content collection. Collection names must match the
// models in server.js. Takes a connected native Db handle.
async function seedContent(db) {
  const projects = readJson("portfolio-projects.json").projects || [];
  const skills = readJson("skills.json").skills || [];
  const terminal = readJson("terminal-commands.json");
  const footer = readJson("footer-data.json").footerData || {};
  const profile = readJson("profile-data.json").profile || {};
  const codeDisplay = readJson("code-display.json").codeDisplay || {};
  const now = new Date();
  const counts = {};

  const seed = async (collection, docs) => {
    await db.collection(collection).deleteMany({});
    if (docs.length) await db.collection(collection).insertMany(docs);
    counts[collection] = docs.length;
  };

  await seed("projects", projects.map((p) => ({ ...p, createdAt: now })));
  await seed("skills", skills.map((s) => ({ ...s, createdAt: now })));
  await seed("terminalcommands", [
    {
      commands: terminal.terminalCommands || [],
      fallbackCommands:
        terminal.fallbackCommands || terminal.terminalCommands || [],
      createdAt: now,
    },
  ]);
  await seed("footer", [
    {
      copyright: footer.copyright || "",
      navigationLinks: footer.navigationLinks || [],
      socialLinks: footer.socialLinks || [],
      createdAt: now,
    },
  ]);
  await seed("profile", [{ ...profile, createdAt: now }]);
  await seed(
    "codedisplays",
    codeDisplay.codeLines?.length
      ? [{ codeLines: codeDisplay.codeLines, createdAt: now }]
      : [],
  );
  return counts;
}

module.exports = { seedContent, DATA_DIR };

if (require.main === module) {
  mongoose
    .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio")
    .then(() => seedContent(mongoose.connection.db))
    .then((counts) => {
      console.log("Database seeded:", counts);
      return mongoose.disconnect();
    })
    .catch((error) => {
      console.error("Error seeding database:", error);
      process.exit(1);
    });
}
