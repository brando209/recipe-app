const mysql = require('mysql');

const connectionOptions = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_SECRET,
    database: process.env.NODE_ENV === 'test' ? process.env.DB_TEST : process.env.DB_NAME
};

const connection = mysql.createConnection(connectionOptions);

module.exports = connection;