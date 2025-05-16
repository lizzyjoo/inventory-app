// db-init.js
const pool = require("./db/pool");

async function initializeDatabase() {
  try {
    console.log("Starting database initialization...");

    // Check if we can connect to the database
    try {
      const testConnection = await pool.query("SELECT NOW()");
      console.log(
        "Database connection successful:",
        testConnection.rows[0].now
      );
    } catch (connError) {
      console.error("Database connection failed:", connError.message);
      return false;
    }

    // Create categories table with explicit schema name
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY, 
          category VARCHAR(50) UNIQUE, 
          src TEXT DEFAULT '/images/default.svg'
        )
      `);
      console.log("Categories table created or already exists");
    } catch (catTableError) {
      console.error("Error creating categories table:", catTableError.message);
      return false;
    }

    // Create inventory table with explicit schema name
    try {
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
    } catch (invTableError) {
      console.error("Error creating inventory table:", invTableError.message);
      return false;
    }

    // Check if categories exist
    let categoryCount;
    try {
      const result = await pool.query("SELECT COUNT(*) FROM categories");
      categoryCount = parseInt(result.rows[0].count);
      console.log(`Found ${categoryCount} categories`);
    } catch (countError) {
      console.error("Error checking categories count:", countError.message);
      categoryCount = 0;
    }

    // Add default categories if none exist
    if (categoryCount === 0) {
      try {
        console.log("Adding default categories...");
        await pool.query(`
          INSERT INTO categories (category, src) VALUES 
          ('Uncategorized', '/images/default.jpg'), 
          ('Bread', '/images/bread.jpg'), 
          ('Pastries','/images/pastries.jpg'), 
          ('Cakes', '/images/cakes.jpg'), 
          ('Drinks', '/images/drinks.jpg')
        `);
        console.log("Default categories added successfully");
      } catch (insertCatError) {
        console.error(
          "Error adding default categories:",
          insertCatError.message
        );
        return false;
      }
    }

    // Check if products exist
    let productCount;
    try {
      const result = await pool.query("SELECT COUNT(*) FROM inventory");
      productCount = parseInt(result.rows[0].count);
      console.log(`Found ${productCount} products in inventory`);
    } catch (countError) {
      console.error("Error checking inventory count:", countError.message);
      productCount = 0;
    }

    // Add sample products if inventory is empty
    if (productCount === 0) {
      try {
        console.log("Adding sample products to inventory...");

        // Get category IDs first to ensure we reference valid IDs
        const categoryIds = await pool.query(
          "SELECT id, category FROM categories"
        );
        const categories = {};

        // Create a map of category names to IDs
        categoryIds.rows.forEach((row) => {
          categories[row.category] = row.id;
        });

        console.log("Category mapping:", categories);

        // Only proceed if we have the necessary categories
        if (
          categories["Bread"] &&
          categories["Pastries"] &&
          categories["Drinks"]
        ) {
          await pool.query(
            `
            INSERT INTO inventory (name, category_id, quantity, price, src, description, isdefault) VALUES 
            ('Sourdough', $1, 20, 4.99, '/images/sourdough.jpg', 'Natural fermentation combines for sweet, nutty, and lightly acidic flavors', true),
            ('Baguette', $1, 20, 3.99, '/images/baguette.jpg', 'Classic French bread with a crispy crust.', true),
            ('Croissants', $2, 25, 3.99, '/images/croissants.jpg', 'Flaky, buttery French pastry.', true),
            ('Espresso', $3, 30, 2.99, '/images/espresso.jpg', 'Strong shot of concentrated coffee.', true)
          `,
            [
              categories["Bread"],
              categories["Bread"],
              categories["Pastries"],
              categories["Drinks"],
            ]
          );
          console.log("Sample products added successfully");
        } else {
          console.error(
            "Required categories not found for adding sample products"
          );
        }
      } catch (insertProdError) {
        console.error("Error adding sample products:", insertProdError.message);
        // Continue even if product insertion fails
      }
    }

    console.log("Database initialization completed successfully");
    return true;
  } catch (error) {
    console.error("Unexpected error during database initialization:", error);
    return false;
  }
}

module.exports = initializeDatabase;
