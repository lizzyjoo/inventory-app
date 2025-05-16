// db/pool.js
const { Pool } = require("pg");
require("dotenv").config();

// Log database connection info for debugging
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

// Configuration for database connection
const config = {
  connectionString: process.env.DATABASE_URL,
  // Enable SSL in production (Railway)
  ...(process.env.NODE_ENV === "production" && {
    ssl: {
      rejectUnauthorized: false,
    },
  }),
};

console.log("PostgreSQL connection config:", {
  ...config,
  connectionString: config.connectionString ? "[HIDDEN]" : undefined,
});

// Create the pool
const pool = new Pool(config);

// Log successful creation
console.log("Database pool created successfully");

// Add error handler
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  // Don't exit process as that would crash the application
});

module.exports = pool;
