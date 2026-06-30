import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));
const JWT_SECRET = process.env.JWT_SECRET || 'device-savant-secret-2024';
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
console.log('Connecting to DB host:', connectionString ? connectionString.split('@')[1] : 'MISSING');

const pool = new Pool({
  connectionString,
  ssl: isProd ? { rejectUnauthorized: false } : false,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      company TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS scores (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      scenario_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      completed_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('Database ready');
}

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
    const result = await pool.query(
      'INSERT INTO users (name, email, company, password_hash) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email.toLowerCase(), company, hash]
    );
    const id = result.rows[0].id;
    const token = jwt.sign({ id, name, email, company }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id, name, email, company } });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Email already registered' });
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  const user = result.rows[0];
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

app.get('/api/me', auth, async (req, res) => {
  const result = await pool.query(
    'SELECT scenario_id, score, total, completed_at FROM scores WHERE user_id = $1 ORDER BY completed_at DESC',
    [req.user.id]
  );
  res.json({ ...req.user, scores: result.rows });
});

app.post('/api/scores', auth, async (req, res) => {
  const { scenario_id, score, total } = req.body;
  await pool.query(
    'INSERT INTO scores (user_id, scenario_id, score, total) VALUES ($1, $2, $3, $4)',
    [req.user.id, scenario_id, score, total]
  );
  res.json({ ok: true });
});

if (isProd) {
  const distPath = join(__dirname, '../dist');
  app.get(/(.*)/, (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

initDb().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
