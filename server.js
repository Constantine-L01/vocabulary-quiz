const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const { Pool } = require('pg'); // Import PostgreSQL client

// PostgreSQL connection pool
const pool = new Pool({
    user: 'your_username',       // Replace with your PostgreSQL username
    host: 'localhost',           // Replace with your PostgreSQL host
    database: 'quiz',            // Replace with your PostgreSQL database name
    password: 'your_password',   // Replace with your PostgreSQL password
    port: 5432,                  // Default PostgreSQL port
});

const app = express();
const PORT = 3000;

// Secret key for signing JWTs
const JWT_SECRET = 'your_secret_key_here';

app.use(express.json());

// Serve static files from the "front" directory
app.use(express.static(path.join(__dirname, 'front')));

// Middleware to verify JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token missing or invalid' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user; // Attach user info to the request
        next();
    });
}

// Login: check credentials, return JWT
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1 AND password = $2',
            [username, password]
        );

        if (result.rows.length > 0) {
            const user = result.rows[0];
            const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ message: 'Login successful', token });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Save score: client sends user_id (protected route)
app.post('/save-score', authenticateToken, async (req, res) => {
    const { correct, total, level, question_set } = req.body;
    const user_id = req.user.id;

    try {
        await pool.query(
            'INSERT INTO scores (user_id, correct, total, completed, level, question_set) VALUES ($1, $2, $3, $4, $5, $6)',
            [user_id, correct, total, new Date(), level, question_set]
        );
        res.json({ message: 'Score saved successfully' });
    } catch (error) {
        console.error('Error saving score:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user history (protected route)
app.get('/history/:userId', authenticateToken, async (req, res) => {
    const userId = req.params.userId;

    try {
        const result = await pool.query(
            `SELECT level, question_set, correct, total, completed
             FROM scores
             WHERE user_id = $1
             ORDER BY completed DESC
             LIMIT 50`,
            [userId]
        );

        const rows = result.rows.map((row, index) => ({
            no: index + 1,
            level: row.level,
            question_set: row.question_set,
            score: `${row.correct}/${row.total}`, // Display as correct/total
            time: row.completed,
        }));

        res.json(rows);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get top 3 users by total score (protected route)
app.get('/leaderboard', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `WITH max_scores AS (
                SELECT 
                    user_id,
                    question_set,
                    MAX(correct) AS max_correct
                FROM scores
                GROUP BY user_id, question_set
            )
            SELECT 
                users.id AS user_id,
                users.username,
                users.profile_pic,
                SUM(max_scores.max_correct) * 10 AS total_score
            FROM max_scores
            JOIN users ON max_scores.user_id = users.id
            GROUP BY users.id
            HAVING SUM(max_scores.max_correct) > 0
            ORDER BY total_score DESC
            LIMIT 3`
        );

        const topUsers = result.rows.map((user, index) => ({
            rank: index + 1,
            user_id: user.user_id,
            username: user.username,
            profile_pic: user.profile_pic,
            total_score: user.total_score, // Display the total score
        }));

        res.json(topUsers);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
