const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

if (process.env.DATABASE_URL) {
  // Railway otomatis memberi DATABASE_URL
  pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    ssl: 'Amazon RDS',
    waitForConnections: true,
    connectionLimit: 10,
  });
=======
  pool = mysql.createPool(process.env.DATABASE_URL + ssl: 'Amazon RDS'');
SyntaxError: missing ) after argument list
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
