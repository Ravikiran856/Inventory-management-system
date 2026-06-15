const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const dbPath = process.env.DB_PATH || './inventory.sqlite';

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Wrap db queries in promises for easier async/await usage
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
};

const withTransaction = async (callback) => {
    await run('BEGIN TRANSACTION');
    try {
        const result = await callback();
        await run('COMMIT');
        return result;
    } catch (error) {
        await run('ROLLBACK');
        throw error;
    }
};

const initDB = async () => {
    try {
        const sqlFilePath = path.join(__dirname, '../../database/inventory.sql');
        if (fs.existsSync(sqlFilePath)) {
            const sqlSchema = fs.readFileSync(sqlFilePath, 'utf-8');
            // Split by semicolon and run each statement
            const statements = sqlSchema.split(';').filter(stmt => stmt.trim() !== '');
            
            // Execute statements sequentially
            for (const statement of statements) {
                await run(statement);
            }
            console.log('Database initialized successfully from inventory.sql');
        } else {
            console.warn(`SQL schema file not found at ${sqlFilePath}`);
        }

        // Remove legacy sales/purchase tables if they exist
        await run('DROP TABLE IF EXISTS sales');
        await run('DROP TABLE IF EXISTS purchases');

        // Ensure default admin password matches admin123 (fixes legacy bad seed hashes)
        const adminHash = await bcrypt.hash('admin123', 10);
        await run(
            'UPDATE users SET password = ?, role = ? WHERE username = ?',
            [adminHash, 'Administrator', 'admin']
        );
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};

module.exports = {
    db,
    query,
    run,
    initDB,
    withTransaction
};
