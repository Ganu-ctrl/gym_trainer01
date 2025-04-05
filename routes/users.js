const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');

// Delete a user by ID
router.delete('/:id', async (req, res) => {
    const userId = req.params.id; // Get the user ID from the request parameters
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            'DELETE FROM users WHERE user_id = :id',
            [userId],
            { autoCommit: true }
        );

        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
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



// Get all users
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
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


router.post('/', async (req, res) => {
    const { username, password, email } = req.body; // Extract user data from the request body
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            `INSERT INTO users (username, password, email) 
             VALUES (:username, :password, :email) 
             RETURNING user_id INTO :id`,
            {
                username,
                password,
                email,
                id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } // Bind output for user_id
            },
            { autoCommit: true } // Commit the transaction
            
        );
        res.json({ id: result.outBinds.id[0], username, email }); // Respond with the inserted user_id
    } catch (err) {
        console.error('Error creating user:', err);
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