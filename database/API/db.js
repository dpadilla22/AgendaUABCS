import mysql from 'mysql2/promise';

async function connect() {
    try {
        const conn = await mysql.createConnection({
            host:  process.env.DB_HOST,
            port:  process.env.DB_PORT,
            user:  process.env.DB_USER,
            password:  process.env.DB_PASSWORD,
            database:  process.env.DB_NAME,
        });
        console.log('DB Connection established');
        return conn;
    } catch(err) {
        console.error('An error occurred while connecting to the database, Error: ', err);
        throw err;
    }
}

export default connect;