const express = require('express');
const session = require('express-session');
const Database = require('better-sqlite3');
const cors = require('cors');

const db = new Database('quiz.db');
const app = express();
const PORT = 3000;

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("Tables:", tables);

app.use(express.json());

app.use(session({
    secret: 'simple-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        secure: false
    }
}));

app.use(cors({
    origin: 'http://127.0.0.1:5500',  // frontend origin
    credentials: true
}));

// Login with username and password
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const stmt = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?');
    const user = stmt.get(username, password);

    if (user) {
        req.session.user = { username };
        res.json({ message: 'Login successful' });
    } else {
        res.status(401).json({ error: 'Invalid username or password' });
    }
});

// Guest login
app.post('/guest', (req, res) => {
    req.session.user = { username: 'guest' };
    res.json({ message: 'Logged in as guest' });
});

// Auth check
function requireAuth(req, res, next) {
    if (!req.session.user || req.session.user.username === 'guest') {
        return res.status(403).json({ error: 'Not allowed for guest' });
    }
    next();
}

// Save score
app.post('/save-score', (req, res) => {
    const { correct, total } = req.body;
    const username = req.session.user.username;

    const stmt = db.prepare('INSERT INTO exam_scores (username, correct, total, timestamp) VALUES (?, ?, ?, ?)');
    stmt.run(username, correct, total, Date.now());

    res.json({ message: 'Score saved successfully' });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
