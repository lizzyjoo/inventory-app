// db-init.js
const pool = require("./db/pool");

async function initializeDatabase() {
  try {
    console.log("Starting database initialization...");

    // Create categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY, 
        category VARCHAR(50) UNIQUE, 
        src TEXT DEFAULT '/images/default.svg'
      )
    `);
    console.log("Categories table created or already exists");

    // Create inventory table
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
    console.log("Inventory table created or already exists");

    // Check if categories exist
    const { rows: categoryCount } = await pool.query(
      "SELECT COUNT(*) FROM categories"
    );
    console.log(`Found ${categoryCount[0].count} categories`);

    // Add default categories if none exist
    if (parseInt(categoryCount[0].count) === 0) {
      console.log("Adding default categories...");
      await pool.query(`
        INSERT INTO categories (category, src) VALUES 
        ('Uncategorized', '/images/default.jpg'),
        ('Bread', '/images/bread.jpg'),
        ('Pastries','/images/pastries.jpg'),
        ('Cakes', '/images/cakes.jpg'),
        ('Drinks', '/images/drinks.jpg')
      `);
      console.log("Default categories added");
    }

    console.log("Database initialization completed successfully");
    return true;
  } catch (error) {
    console.error("Database initialization error:", error);
    return false;
  }
}

module.exports = initializeDatabase;
