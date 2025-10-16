// Load modules
import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

// Define which columns you want to auto-parse as JSON
const JSON_COLUMNS = new Set(['profile', 'active_subscription','trainer','app_user','subscription_plans','features']);

// Initialize pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST || '72.60.205.181',
    user: process.env.DB_USER || 'dbuser',
    password: process.env.DB_PASSWORD || 'Pa$$W0rd@123',
    database: process.env.DB_NAME || 'garbhsarthi',
    debug: false,

    /**
     * Automatically parse JSON columns returned as strings
     * (MariaDB returns JSON_OBJECT() as text, not real JSON)
     */
    typeCast(field, next) {
        // Only parse specific columns
        if (JSON_COLUMNS.has(field.name)) {
            const value = field.string();
            if (value === null) return null;
            try {
                return JSON.parse(value);
            } catch {
                return value; // fallback if not valid JSON
            }
        }
        // Everything else → default behavior
        return next();
    },
});

export default pool;
