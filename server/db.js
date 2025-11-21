const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'data.db');

const db = new sqlite3.Database(DB_PATH);

// Initialize schema
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER NOT NULL DEFAULT 0,
      category_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(category_id) REFERENCES categories(id)
    )
  `);

  // Seed some default categories if none exist
  db.get('SELECT COUNT(*) as cnt FROM categories', (err, row) => {
    if (!err && row && row.cnt === 0) {
      const stmt = db.prepare('INSERT INTO categories (name) VALUES (?)');
      ['Work', 'Personal', 'Shopping'].forEach((n) => stmt.run(n));
      stmt.finalize();
    }
  });
});

module.exports = db;
