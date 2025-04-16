const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');

const db = new Database('quiz.db');
const app = express();
const PORT = 3000;

// Debug: show existing tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
// CORS middleware (adjust origin as needed for frontend)
app.use(cors());

app.use(express.json());

// Login: check credentials, return user_id
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const stmt = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?');
    const user = stmt.get(username, password);

    if (user) {
        res.json({
            message: 'Login successful',
            user_id: user.id,
            username: user.username,
        });
    } else {
        res.status(401).json({ error: 'Invalid username or password' });
    }
});

// Save score: client sends user_id
app.post('/save-score', (req, res) => {
    const { user_id, correct, total, level, question_set } = req.body;

    const stmt = db.prepare('INSERT INTO scores (user_id, correct, total, timestamp, level, question_set) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(user_id, correct, total, Date.now(), level, question_set);

    res.json({ message: 'Score saved successfully' });
});

app.get('/history/:userId', (req, res) => {
    const userId = req.params.userId;

    const stmt = db.prepare(`
        SELECT level, question_set, correct, total, timestamp
        FROM scores
        WHERE user_id = ?
        ORDER BY timestamp DESC
        LIMIT 50
    `);

    const rows = stmt.all(userId).map((row, index) => ({
        no: index + 1,
        level: row.level,
        question_set: row.question_set,
        score: `${Math.round((row.correct / row.total) * 100)}%`,
        time: row.timestamp,
    }));

    res.json(rows);
});

// Get top 3 users by total score percentage
app.get('/leaderboard', (req, res) => {
    console.log("leaderboard");
    const stmt = db.prepare(`
        SELECT 
            users.id AS user_id,
            users.username,
            users.profile_pic,
            SUM(scores.correct) AS total_correct,
            SUM(scores.total) AS total_questions
        FROM scores
        JOIN users ON scores.user_id = users.id
        GROUP BY users.id
        HAVING total_questions > 0 AND total_correct > 0
        ORDER BY (1.0 * total_correct / total_questions) DESC
        LIMIT 3
    `);

    const topUsers = stmt.all().map((user, index) => ({
        rank: index + 1,
        user_id: user.user_id,
        username: user.username,
        profile_pic: user.profile_pic,
        score: `${Math.round((user.total_correct / user.total_questions) * 100)}%`
    }));

    console.log(topUsers);

    res.json(topUsers);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
