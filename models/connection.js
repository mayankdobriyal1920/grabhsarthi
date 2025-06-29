// Load module
import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file
// Initialize pool
var pool = mysql.createPool({
    connectionLimit : 10,
    host: process.env.DB_HOST || '178.16.138.111',
    user: process.env.DB_USER || 'dbuser',
    password: process.env.DB_PASSWORD || 'Pa$$W0rd@123$$',
    database: process.env.DB_NAME || 'unikpayindia',
    debug    :  false
});
export default pool;