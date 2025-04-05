const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');

// Create a new log
router.post('/', async (req, res) => {
  
    const { workout_id, exercise_id, sets, reps, weight, log_date } = req.body; // Extract log data from the request body
    let connection;
    try {
        connection = await oracledb.getConnection();
        console.log('Received log data:', req.body);

        const result = await connection.execute(
            `INSERT INTO logs (workout_id, exercise_id, sets, reps, weight, log_date) 
             VALUES (:workout_id, :exercise_id, :sets, :reps, :weight, TO_DATE(:log_date, 'YYYY-MM-DD')) 
             RETURNING log_id INTO :id`,
            {
                workout_id,
                exercise_id,
                sets,
                reps,
                weight,
                log_date,
                id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } // Bind output for log_id
            },
            { autoCommit: true } // Commit the transaction
        );
        res.json({ id: result.outBinds.id[0], workout_id, exercise_id, sets, reps, weight, log_date }); // Respond with the inserted log_id
    } catch (err) {
        console.error('Error creating log:', err);
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