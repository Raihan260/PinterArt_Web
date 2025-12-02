require('dotenv').config();
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_change_me';
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

async function ensureDataFiles() {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  try {
    await fsp.access(USERS_FILE, fs.constants.F_OK);
  } catch {
    await fsp.writeFile(USERS_FILE, '[]', 'utf-8');
  }
}

async function readUsers() {
  const raw = await fsp.readFile(USERS_FILE, 'utf-8');
  try {
    const u = JSON.parse(raw);
    return Array.isArray(u) ? u : [];
  } catch {
    return [];
  }
}

async function writeUsers(users) {
  await fsp.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

function toEmailKey(email) {
  return String(email || '').trim().toLowerCase();
}

function createApp() {
  const app = express();

  // CORS: allow same-origin and file-served pages; adjust as needed
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(cookieParser());

  // Static serving for existing frontend folders
  ['HTML', 'CSS', 'ASSETS', 'JAVA_SCRIPT'].forEach((dir) => {
    app.use('/' + dir, express.static(path.join(ROOT, dir)));
  });

  app.get('/', (_req, res) => {
    res.redirect('/HTML/login_page.html');
  });

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // Auth helpers
  function setAuthCookie(res, payload) {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // set true when using HTTPS
      maxAge: 24 * 60 * 60 * 1000,
    });
  }

  function authOptional(req, _res, next) {
    const t = req.cookies && req.cookies.token;
    if (!t) return next();
    try {
      req.user = jwt.verify(t, JWT_SECRET);
    } catch {
      // ignore invalid token
    }
    next();
  }

  app.get('/me', authOptional, (req, res) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    res.json({ user: req.user });
  });

  // Register
  app.post('/register', async (req, res) => {
    try {
      const { name, email, password } = req.body || {};
      const errors = [];
      if (!name || String(name).trim().length < 2) errors.push('Name is required.');
      const emailKey = toEmailKey(email);
      if (!emailKey || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailKey)) errors.push('Valid email is required.');
      if (!password || String(password).length < 6 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        errors.push('Password must be at least 6 chars and contain letters and numbers.');
      }
      if (errors.length) return res.status(400).json({ message: errors[0], errors });

      const users = await readUsers();
      const exists = users.find((u) => u.email === emailKey);
      if (exists) return res.status(409).json({ message: 'Email already registered.' });

      const passwordHash = await bcrypt.hash(password, 10);
      const user = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        name: String(name).trim(),
        email: emailKey,
        passwordHash,
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      await writeUsers(users);

      // Optionally sign in immediately; for now, just respond success
      res.status(201).json({ message: 'Registered successfully.' });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ message: 'Internal server error.' });
    }
  });

  // Login
  app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body || {};
      const emailKey = toEmailKey(email);
      if (!emailKey || !password) return res.status(400).json({ message: 'Email and password are required.' });

      const users = await readUsers();
      const user = users.find((u) => u.email === emailKey);
      if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ message: 'Invalid email or password.' });

      setAuthCookie(res, { sub: user.id, email: user.email, name: user.name });
      res.json({ message: 'Login successful.' });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Internal server error.' });
    }
  });

  // Logout (optional)
  app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out.' });
  });

  // Placeholder for Google OAuth
  app.get('/auth/google', (_req, res) => {
    res.status(501).json({ message: 'Google OAuth not configured. See server/README.md to enable.' });
  });

  // Minimal forgot-password placeholder
  app.get('/forgot-password', (_req, res) => {
    res.status(501).send('Forgot password flow not implemented.');
  });

  // 404 handler for JSON endpoints
  app.use((req, res, next) => {
    if (req.path.startsWith('/HTML') || req.path.startsWith('/CSS') || req.path.startsWith('/ASSETS') || req.path.startsWith('/JAVA_SCRIPT')) {
      return next();
    }
    res.status(404).json({ message: 'Not found' });
  });

  // Error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  });

  return app;
}

(async function main() {
  await ensureDataFiles();
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`PinterArt backend running at http://localhost:${PORT}`);
  });
})();
