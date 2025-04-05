const express = require('express');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');
const path = require('path');

const app = express();
const port = 5001;
const cors = require('cors');
app.use(cors());

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Oracle DB connection
const dbConfig = {
    user: 'system',
    password: 'itsmearavindh123',
    connectString: 'localhost/XEPDB1'
};

async function initialize() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Oracle DB connected...');
    } catch (err) {
        console.error('Error connecting to Oracle DB:', err);
    }
}

initialize();

// Home route serving HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Routes
app.use('/users', require('./routes/users'));
app.use('/workouts', require('./routes/workouts'));
app.use('/exercises', require('./routes/exercises'));
app.use('/logs', require('./routes/logs'));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
