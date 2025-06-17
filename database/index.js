const { Pool } = require("pg")
require("dotenv").config()

// Log environment variables for debugging
console.log("NODE_ENV:", process.env.NODE_ENV)
console.log("DATABASE_URL:", process.env.DATABASE_URL)

let pool
if (process.env.NODE_ENV === "development") {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false // Allow self-signed certificates for Render.com
        },
        max: 10,                      // Maximum number of connections
        idleTimeoutMillis: 30000,     // Close idle connections after 30 seconds
        connectionTimeoutMillis: 5000 // Connection timeout after 5 seconds
    })
} else {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
    })
}

// Listen for connection pool errors
pool.on("error", (err) => {
    console.error("Connection pool error:", err.stack)
})

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error("Connection pool failed to connect:", err.stack)
    }
    console.log("Successfully connected to the database")
    release()
})

module.exports = {
    async query(text, params) {
        try {
            console.log("Executing query:", { text, params })
            const res = await pool.query(text, params)
            return res
        } catch (error) {
            console.error("Query error:", { text, error: error.message })
            throw error
        }
    }
}