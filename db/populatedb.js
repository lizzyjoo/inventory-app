const { Pool } = require("pg");
require("dotenv").config();

const dropTables = `DROP TABLE IF EXISTS inventory, categories;`;

const createCategoriesTable = `CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY, 
  category VARCHAR(50) UNIQUE, 
  color TEXT
)`;

const createSQLTable = `CREATE TABLE IF NOT EXISTS inventory (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY, 
  name VARCHAR(50) UNIQUE, 
  category_id INTEGER REFERENCES categories(id), 
  quantity INTEGER, 
  price DECIMAL(5, 2), 
  src TEXT DEFAULT '/images/default.svg', 
  description VARCHAR(200), 
  isDefault BOOLEAN
)`;

const createCategories = `INSERT INTO categories (category, color) VALUES 
  ('Uncategorized', '#fefefe'), 
  ('Bread', '#ffc26c'), 
  ('Pastry','#f8a5c2'), 
  ('Cake', '#c5a3ff'), 
  ('Drink', '#92d5e6');`;

const createSQLData = `INSERT INTO inventory (name, category_id, quantity, price, src, description, isdefault) VALUES 
  ('Sourdough', 2, 20, 4.99, '/images/sourdough.jpg', 'Natural fermentation combines for sweet, nutty, and lightly acidic flavors', true)`;

async function main() {
  console.log("Seeding database...");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });

  try {
    // Connect and run setup
    console.log("Connected to database.");

    // Drop tables
    await pool.query(dropTables);
    console.log("Tables dropped.");

    // Create tables
    await pool.query(createCategoriesTable);
    console.log("Categories table created.");

    await pool.query(createSQLTable);
    console.log("Inventory table created.");

    // Insert data
    await pool.query(createCategories);
    console.log("Categories inserted.");

    await pool.query(createSQLData);
    console.log("Product data inserted.");

    // Verify data was inserted
    const categoryCheck = await pool.query("SELECT * FROM categories");
    console.log(`Categories in database: ${categoryCheck.rowCount}`);

    const productCheck = await pool.query("SELECT * FROM inventory");
    console.log(`Products in database: ${productCheck.rowCount}`);
  } catch (error) {
    console.error("Error during database seeding:", error);
  } finally {
    await pool.end();
    console.log("Database seeding completed.");
  }
}

main();
