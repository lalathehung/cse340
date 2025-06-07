const { Pool } = require('pg')
require('dotenv').config()
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})
async function testConnection() {
    try {
        const client = await pool.connect()
        console.log('Connected successfully')
        const result = await client.query('SELECT * FROM public.classification')
        console.log('Query result:', result.rows)
        client.release()
        await pool.end()
    } catch (error) {
        console.error('Connection error:', error.stack)
    }
}
testConnection()