const express = require("express");
const app = express();
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config();

// Environment variable check
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in .env file");
  process.exit(1);
}

// Setup DB connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});
app.locals.pool = pool;

// Set up middleware BEFORE route initialization
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // parse incoming request bodies

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Basic database check - doesn't try to initialize, just verifies connection
async function checkDatabaseConnection() {
  try {
    console.log("Testing database connection...");
    const result = await pool.query("SELECT NOW() as now");
    console.log("Database connection successful:", result.rows[0].now);

    // Check if tables exist
    const tablesCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'categories'
      ) as categories_exist,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'inventory'
      ) as inventory_exist
    `);

    console.log("Tables exist:", tablesCheck.rows[0]);

    if (
      !tablesCheck.rows[0].categories_exist ||
      !tablesCheck.rows[0].inventory_exist
    ) {
      console.warn(
        "Some required tables don't exist. Run populatedb.js to set up the database."
      );
    } else {
      // Check if data exists
      const categoryCount = await pool.query("SELECT COUNT(*) FROM categories");
      const productCount = await pool.query("SELECT COUNT(*) FROM inventory");
      console.log(
        `Database has ${categoryCount.rows[0].count} categories and ${productCount.rows[0].count} products`
      );
    }

    return true;
  } catch (error) {
    console.error("Database check failed:", error);
    return false;
  }
}

// Just check the database connection, don't initialize
checkDatabaseConnection().then((connected) => {
  if (!connected) {
    console.warn(
      "Database connection issues detected - app may not function correctly"
    );
  }

  // Set up routes ONLY ONCE - regardless of database status
  const indexRoutes = require("./routers/index");
  const productRoutes = require("./routers/products");
  const categoryRoutes = require("./routers/categories");

  app.use("/", indexRoutes);
  app.use("/products", productRoutes);
  app.use("/categories", categoryRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).render("404");
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error("Application error:", err);
    res.status(500).send("Something went wrong. Please try again later.");
  });

  // Start server ONLY ONCE
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Express app listening on port ${PORT}`);
  });
});

// Comments for understanding flow
// 1. client(browser) makes HTTP request to my app, receives public file stuff
// 2. browser will render pages depending on what it receives from the server
// 3. express server is listening to port 3000
// a. handle requests, routing those requests to appropriate handlers
// b. connect PostgreSQL (using connection details from .env)
// c. render ejs views and sends to browser
// 4. if i deploy stuff to railway, environment variables -> railway dashboard
