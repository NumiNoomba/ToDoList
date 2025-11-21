require('dotenv').config();
const { DATABASE_URL, PORT } = process.env;
module.exports = {
  databaseUrl: DATABASE_URL || 'postgres://user:password@localhost:5432/tododb',
  port: Number(PORT) || 4000
};
