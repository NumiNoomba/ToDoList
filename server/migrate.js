const { execSync } = require('child_process');
const path = require('path');
const cfg = require('./config');

const migrationsDir = path.join(__dirname, 'migrations');
const upFile = path.join(migrationsDir, '001_init.up.sql');
const downFile = path.join(migrationsDir, '001_init.down.sql');

const cmd = process.argv[2];
if (!cmd || !['up','down'].includes(cmd)) {
  console.error('Usage: node migrate.js [up|down]'); process.exit(1);
}

const psql = (sqlFile) => {
  if (!cfg.databaseUrl) { console.error('DATABASE_URL is not set'); process.exit(1); }
  // Using psql with connection string
  const c = `psql "${cfg.databaseUrl}" -f "${sqlFile}"`;
  console.log('Running:', c);
  execSync(c, { stdio: 'inherit' });
}

if (cmd === 'up') psql(upFile);
if (cmd === 'down') psql(downFile);
