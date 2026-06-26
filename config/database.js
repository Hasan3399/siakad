const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

if (process.env.DATABASE_URL) {
  // Parse DATABASE_URL secara manual
  const url = new URL(process.env.DATABASE_URL);
  
  pool = mysql.createPool({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading '/'
    waitForConnections: true,
    connectionLimit: 10,
    ssl: 'Amazon RDS',
  });
} else {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'siakad',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 10,
  });
}

module.exports = pool;

