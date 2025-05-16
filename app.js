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

// Add this after establishing the pool connection
async function checkDatabaseSetup() {
  try {
    // Check if tables exist
    const tablesExist = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'categories'
      ) AS categories_exist,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'inventory'
      ) AS inventory_exist
    `);

    console.log("Database tables check:", tablesExist.rows[0]);

    // If tables don't exist, we need to create them
    if (
      !tablesExist.rows[0].categories_exist ||
      !tablesExist.rows[0].inventory_exist
    ) {
      console.log("Required tables missing - running database setup");
      // This is where you would call your seed script
      // You could either import your seed.js functions or run them directly here
      return false;
    }

    // Check if any categories exist
    const categoryCount = await pool.query("SELECT COUNT(*) FROM categories");
    console.log(`Categories in database: ${categoryCount.rows[0].count}`);

    if (categoryCount.rows[0].count == 0) {
      console.log("No categories found - database may need seeding");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Database setup check failed:", error);
    return false;
  }
}

// Call the check at startup
checkDatabaseSetup().then((isSetup) => {
  if (isSetup) {
    console.log("Database is properly set up");
  } else {
    console.log("Database setup issue detected");
    // You could trigger automatic seeding here
  }
});
// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // parse incoming request bodies

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
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

app.use((err, req, res, next) => {
  console.error("Application error:", err);
  res.status(500).send("Something went wrong. Please try again later.");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express app listening on port ${PORT}`);
});

// 1. client(browser) makes HTTP request to my app, receives public file stuff
// 2. browser will render pages depending on what it receives from the server
// 3. express server is listening to port 3000
// a. handle requests, routing those requests to appropriate handlers
// b. connect PostgreSQL (using connection details from .env)
// c. render ejs views and sends to browser
// 4. if i deploy stuff to railway, environment variables -> railway dashboard
