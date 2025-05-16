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

// Initialize database and then set up routes ONCE
const initializeDatabase = require("./db-init");

// Before setting up routes and starting the server
initializeDatabase().then((success) => {
  if (success) {
    console.log("Database initialized successfully");
  } else {
    console.warn("Database initialization had issues");
  }

  // Set up routes ONLY ONCE
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
