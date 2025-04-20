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
});
app.locals.pool = pool;

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

// Start server
const PORT = 3000; // const PORT = process.env.PORT || 3000;
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
