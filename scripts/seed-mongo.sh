#!/usr/bin/env sh
set -eu

CONTAINER="${MONGO_CONTAINER:-profile-mongodb}"
DB_NAME="${MONGO_DB:-portfolio}"
MONGO_USER="${MONGO_USER:-admin}"
MONGO_PASS="${MONGO_PASS:-password123}"
DATA_DIR="${DATA_DIR:-./data}"

if [ ! -d "$DATA_DIR" ]; then
  echo "Data directory not found: $DATA_DIR" >&2
  exit 1
fi

echo "Seeding MongoDB container: $CONTAINER (db: $DB_NAME)"

# Prepare import files inside container
docker exec "$CONTAINER" sh -lc "rm -rf /tmp/seed-data && mkdir -p /tmp/seed-data"
docker cp "$DATA_DIR/portfolio-projects.json" "$CONTAINER:/tmp/seed-data/portfolio-projects.json"
docker cp "$DATA_DIR/skills.json" "$CONTAINER:/tmp/seed-data/skills.json"
docker cp "$DATA_DIR/terminal-commands.json" "$CONTAINER:/tmp/seed-data/terminal-commands.json"
docker cp "$DATA_DIR/footer-data.json" "$CONTAINER:/tmp/seed-data/footer-data.json"

# Use mongosh for deterministic insertion from wrapped JSON files.
docker exec "$CONTAINER" mongosh --quiet -u "$MONGO_USER" -p "$MONGO_PASS" --authenticationDatabase admin --eval "
  const fs = require('fs');
  const d = db.getSiblingDB('$DB_NAME');

  const projects = JSON.parse(fs.readFileSync('/tmp/seed-data/portfolio-projects.json', 'utf8')).projects || [];
  const skills = JSON.parse(fs.readFileSync('/tmp/seed-data/skills.json', 'utf8')).skills || [];
  const terminal = JSON.parse(fs.readFileSync('/tmp/seed-data/terminal-commands.json', 'utf8'));
  const footer = JSON.parse(fs.readFileSync('/tmp/seed-data/footer-data.json', 'utf8')).footerData || {};

  d.projects.deleteMany({});
  d.skills.deleteMany({});
  d.terminalcommands.deleteMany({});
  d.footer.deleteMany({});

  if (projects.length) d.projects.insertMany(projects);
  if (skills.length) d.skills.insertMany(skills);
  d.terminalcommands.insertOne({
    commands: terminal.terminalCommands || [],
    fallbackCommands: terminal.fallbackCommands || (terminal.terminalCommands || []),
    createdAt: new Date()
  });
  d.footer.insertOne({
    copyright: footer.copyright || 'Profile. All rights reserved.',
    navigationLinks: footer.navigationLinks || [],
    socialLinks: footer.socialLinks || [],
    createdAt: new Date()
  });

  printjson({
    projects: d.projects.countDocuments(),
    skills: d.skills.countDocuments(),
    terminalcommands: d.terminalcommands.countDocuments(),
    footer: d.footer.countDocuments()
  });
"

echo "Seed complete."
