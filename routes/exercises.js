const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');

// Get all exercises
router.get('/', async (req, res) => {
    let connection;
    try {
        console.log('Attempting to connect to the database...');
        connection = await oracledb.getConnection();
        console.log('Database connection successful.');

        console.log('Executing query...');
        const result = await connection.execute('SELECT * FROM exercises');
        console.log('Query result:', result.rows);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching exercises:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log('Connection closed.');
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
});
// Create a new exercise
router.post('/', async (req, res) => {
    const { name, description } = req.body; // Extract exercise data from the request body
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            `INSERT INTO exercises (name, description) 
             VALUES (:name, :description) 
             RETURNING exercise_id INTO :id`,
            {
                name,
                description,
                id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } // Bind output for exercise_id
            },
            { autoCommit: true } // Commit the transaction
        );
        res.json({ id: result.outBinds.id[0], name, description }); // Respond with the inserted exercise_id
    } catch (err) {
        console.error('Error creating exercise:', err);
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

// Delete an exercise by ID
router.delete('/:id', async (req, res) => {
    const exerciseId = req.params.id; // Get the exercise ID from the request parameters
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            'DELETE FROM exercises WHERE exercise_id = :id',
            { id: exerciseId }, // Use named bind variables for consistency
            { autoCommit: true }
        );

        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        res.status(200).json({ message: 'Exercise deleted successfully' });
    } catch (err) {
        console.error('Error deleting exercise:', err);
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