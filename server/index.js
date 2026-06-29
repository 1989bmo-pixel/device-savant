import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, 'savant.db'));
const JWT_SECRET = process.env.JWT_SECRET || 'device-savant-secret-2024';
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// Init schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    company TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    scenario_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const app = express();
app.use(cors({ origin: isProd ? 'https://devicesavant.com' : 'http://localhost:5173' }));
app.use(express.json());

if (isProd) {
  const distPath = join(__dirname, '../dist');
  app.use(express.static(distPath));
}

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

app.post('/api/signup', async (req, res) => {
  const { name, email, company, password } = req.body;
  if (!name || !email || !company || !password)
    return res.status(400).json({ error: 'All fields required' });

  const hash = await bcrypt.hash(password, 10);
  try {
    const result = db.prepare(
      'INSERT INTO users (name, email, company, password_hash) VALUES (?, ?, ?, ?)'
    ).run(name, email.toLowerCase(), company, hash);

    const token = jwt.sign({ id: result.lastInsertRowid, name, email, company }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: result.lastInsertRowid, name, email, company } });
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Email already registered' });
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, company: user.company },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, company: user.company } });
});

app.get('/api/me', auth, (req, res) => {
  const scores = db.prepare(
    'SELECT scenario_id, score, total, completed_at FROM scores WHERE user_id = ? ORDER BY completed_at DESC'
  ).all(req.user.id);
  res.json({ ...req.user, scores });
});

app.post('/api/scores', auth, (req, res) => {
  const { scenario_id, score, total } = req.body;
  db.prepare('INSERT INTO scores (user_id, scenario_id, score, total) VALUES (?, ?, ?, ?)')
    .run(req.user.id, scenario_id, score, total);
  res.json({ ok: true });
});

if (isProd) {
  const distPath = join(__dirname, '../dist');
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
