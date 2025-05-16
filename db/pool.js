// Update your pool.js file or wherever you create your database connection
const { Pool } = require("pg");
require("dotenv").config();

let poolConfig = {};

if (process.env.DATABASE_URL) {
  // For Railway/production environment
  console.log("Using DATABASE_URL for PostgreSQL connection");
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required for Railway PostgreSQL
    },
  };
} else {
  // For local development
  console.log("Using local PostgreSQL connection");
  poolConfig = {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };
}

console.log("Database connection config:", {
  ...poolConfig,
  // Don't log the full connection string or password
  connectionString: poolConfig.connectionString
    ? "[CONNECTION STRING SET]"
    : undefined,
  password: poolConfig.password ? "[PASSWORD SET]" : undefined,
});

const pool = new Pool(poolConfig);

// Test connection on startup
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection test failed:", err);
  } else {
    console.log("Database connected successfully:", res.rows[0].now);
  }
});

module.exports = pool;
