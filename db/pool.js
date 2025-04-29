const { Pool } = require("pg");
require("dotenv").config();

// Check for DATABASE_URL environment variable
if (!process.env.DATABASE_URL && process.env.NODE_ENV === "production") {
  console.error("DATABASE_URL environment variable is required in production");
  process.exit(1);
}

module.exports = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});
