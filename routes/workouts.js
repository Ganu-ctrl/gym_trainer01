const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');

// Get all workouts
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute('SELECT * FROM workouts');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching workouts:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
});

// Create a new workout
router.post('/', async (req, res) => {
    const { user_id, name } = req.body;
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            'INSERT INTO workouts (user_id, name) VALUES (:user_id, :name)',
            [user_id, name],
            { autoCommit: true }
        );
        res.json({ id: result.lastRowid, user_id, name });
    } catch (err) {
        console.error('Error creating workout:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
});

module.exports = router;