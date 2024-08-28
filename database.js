const sqlite3 = require('sqlite3').verbose();

// Connect to the SQLite database
const db = new sqlite3.Database('./phonebill.db', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to database');
    }
});

// Create the price_plan table if it doesn't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS price_plan (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plan_name TEXT,
            sms_price REAL,
            call_price REAL
        )
    `);
});

module.exports = db;
