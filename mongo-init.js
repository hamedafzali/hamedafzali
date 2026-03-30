// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the portfolio database
db = db.getSiblingDB('portfolio');

// Create collections with indexes
db.createCollection('projects');
db.projects.createIndex({ title: 1 });
db.projects.createIndex({ category: 1 });

db.createCollection('skills');
db.skills.createIndex({ name: 1 });
db.skills.createIndex({ category: 1 });

db.createCollection('codedisplays');
db.codedisplays.createIndex({ language: 1 });

db.createCollection('terminalcommands');
db.terminalcommands.createIndex({ command: 1 });

db.createCollection('footer');
db.footer.createIndex({ createdAt: 1 });

db.createCollection('profile');
db.profile.createIndex({ createdAt: 1 });

// Create a user for the application
db.createUser({
  user: 'portfolio_user',
  pwd: 'portfolio_password',
  roles: [
    {
      role: 'readWrite',
      db: 'portfolio'
    }
  ]
});

print('MongoDB initialization completed successfully!');
