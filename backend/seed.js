// Local seed script. Reads the same data/*.json files as the Docker seed
// (mongo-seed.js) so there is a single source of truth for portfolio content.
// Usage: MONGODB_URI=... node seed.js
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const DATA_DIR = path.resolve(__dirname, "..", "data");

const readJson = (file) =>
  JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));

async function seedDatabase() {
  const projects = readJson("portfolio-projects.json").projects || [];
  const skills = readJson("skills.json").skills || [];
  const terminal = readJson("terminal-commands.json");
  const footer = readJson("footer-data.json").footerData || {};
  const profile = readJson("profile-data.json").profile || {};
  const codeDisplay = readJson("code-display.json").codeDisplay || {};

  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio",
    );
    const db = mongoose.connection.db;
    const now = new Date();

    // Collection names must match the models in server.js.
    const seed = async (collection, docs) => {
      await db.collection(collection).deleteMany({});
      if (docs.length) await db.collection(collection).insertMany(docs);
      console.log(`${collection.padEnd(18)} ${docs.length}`);
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

    console.log("Database seeded successfully.");
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
