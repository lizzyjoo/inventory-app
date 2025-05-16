// seed.js
const { Pool } = require("pg");
require("dotenv").config();

async function seed() {
  console.log("Starting database seed process...");

  // Create connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });

  try {
    console.log("Connected to database");

    // Create tables
    console.log("Creating categories table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY, 
        category VARCHAR(50) UNIQUE, 
        src TEXT DEFAULT '/images/default.svg'
      )
    `);

    console.log("Creating inventory table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY, 
        name VARCHAR(50) UNIQUE, 
        category_id INTEGER REFERENCES categories(id), 
        quantity INTEGER, 
        price DECIMAL(5, 2), 
        src TEXT DEFAULT '/images/default.svg', 
        description VARCHAR(200), 
        isDefault BOOLEAN
      )
    `);

    // Check if any categories exist
    const categoryCount = await pool.query("SELECT COUNT(*) FROM categories");

    if (parseInt(categoryCount.rows[0].count) === 0) {
      console.log("Adding default categories...");
      await pool.query(`
        INSERT INTO categories (category, src) VALUES 
        ('Uncategorized', '/images/default.jpg'), 
        ('Bread', '/images/bread.jpg'), 
        ('Pastries','/images/pastries.jpg'), 
        ('Cakes', '/images/cakes.jpg'), 
        ('Drinks', '/images/drinks.jpg')
      `);
    }

    // Check if any products exist
    const productCount = await pool.query("SELECT COUNT(*) FROM inventory");

    if (parseInt(productCount.rows[0].count) === 0) {
      console.log("Adding sample products...");
      // Add a few sample products
      await pool.query(`
        INSERT INTO inventory (name, category_id, quantity, price, src, description, isdefault) VALUES 
        ('Sourdough', 2, 20, 4.99, '/images/sourdough.jpg', 'Natural fermentation combines for sweet, nutty, and lightly acidic flavors', true),
        ('Baguette', 2, 20, 3.99, '/images/baguette.jpg', 'Classic French bread with a crispy crust.', true),
        ('Croissants', 3, 25, 3.99, '/images/croissants.jpg', 'Flaky, buttery French pastry.', true),
        ('Espresso', 5, 30, 2.99, '/images/espresso.jpg', 'Strong shot of concentrated coffee.', true)
      `);
    }

    // Verify data
    const categories = await pool.query("SELECT * FROM categories");
    console.log(`Database now has ${categories.rows.length} categories`);

    const products = await pool.query("SELECT * FROM inventory");
    console.log(`Database now has ${products.rows.length} products`);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await pool.end();
  }
}

// Run the seed function
seed().catch((err) => {
  console.error("Seed process failed:", err);
  process.exit(1);
});
