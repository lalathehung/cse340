const { Pool } = require("pg")
require("dotenv").config()
console.log('DATABASE_URL:', process.env.DATABASE_URL)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, 
    max: 5, 
    idleTimeoutMillis: 30000, 
    connectionTimeoutMillis: 10000 
})
pool.on('connect', () => {
    console.log('Database connection established')
})
pool.on('error', (err) => {
    console.error('Unexpected database error:', err.stack)
})
// Keep development
module.exports = {
    async query(text, params) {
        try {
            const res = await pool.query(text, params)
            console.log("executed query", { text, rowCount: res.rowCount, rows: res.rows })
            return res
        } catch (error) {
            console.error("Error in query:", { text, error: error.stack })
            throw error
        }
    }
}