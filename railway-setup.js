// railway-setup.js
const { Pool } = require("pg");
require("dotenv").config();

const createCategoriesTable = `CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY, 
  category VARCHAR(50) UNIQUE, 
  src TEXT DEFAULT '/images/default.svg'
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

const createCategories = `INSERT INTO categories (category, src) VALUES 
  ('Uncategorized', '/images/default.jpg'), 
  ('Bread', '/images/bread.jpg'), 
  ('Pastries','/images/pastries.jpg'), 
  ('Cakes', '/images/cakes.jpg'), 
  ('Drinks', '/images/drinks.jpg')
  ON CONFLICT (category) DO NOTHING;`; // This prevents duplicate entries

const createSQLData = `INSERT INTO inventory (name, category_id, quantity, price, src, description, isdefault) 
SELECT * FROM (VALUES 
  ('Sourdough', 2, 20, 4.99, '/images/sourdough.jpg', 'Natural fermentation combines for sweet, nutty, and lightly acidic flavors', true),
  ('Baguette', 2, 20, 3.99, '/images/baguette.jpg', 'Classic French bread with a crispy crust.', true)
  -- Add more products here as needed
) AS new_values (name, category_id, quantity, price, src, description, isdefault)
WHERE NOT EXISTS (
  SELECT 1 FROM inventory WHERE name = new_values.name
);`;

async function setup() {
  console.log("Setting up Railway database...");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("Connected to database.");

    // Create tables (never drops tables)
    await pool.query(createCategoriesTable);
    console.log("Categories table created or already exists.");

    await pool.query(createSQLTable);
    console.log("Inventory table created or already exists.");

    // Check if categories exist
    const categoryCheck = await pool.query("SELECT COUNT(*) FROM categories");
    console.log(`Found ${categoryCheck.rows[0].count} categories.`);

    // Only add categories if none exist
    if (parseInt(categoryCheck.rows[0].count) === 0) {
      await pool.query(createCategories);
      console.log("Categories inserted.");
    } else {
      console.log("Categories already exist, skipping insertion.");
    }

    // Check if products exist
    const productCheck = await pool.query("SELECT COUNT(*) FROM inventory");
    console.log(`Found ${productCheck.rows[0].count} products.`);

    // Only add products if none exist
    if (parseInt(productCheck.rows[0].count) === 0) {
      // Split the large product insertion into smaller chunks to avoid issues
      console.log("Adding Bread products...");
      await pool.query(`
        INSERT INTO inventory (name, category_id, quantity, price, src, description, isdefault) VALUES 
        ('Sourdough', 2, 20, 4.99, '/images/sourdough.jpg', 'Natural fermentation combines for sweet, nutty, and lightly acidic flavors', true),
        ('Baguette', 2, 20, 3.99, '/images/baguette.jpg', 'Classic French bread with a crispy crust.', true),
        ('German Rye', 2, 15, 4.29, '/images/german-rye.jpg', 'Dense rye bread with a rich flavor.', true),
        ('Focaccia', 2, 18, 4.49, '/images/focaccia.jpg', 'Olive oil-rich Italian flatbread.', true),
        ('Challah', 2, 16, 5.49, '/images/challah.jpg', 'Soft braided bread, slightly sweet.', false)
        ON CONFLICT (name) DO NOTHING;
      `);

      console.log("Adding more Bread products...");
      await pool.query(`
        INSERT INTO inventory (name, category_id, quantity, price, src, description, isdefault) VALUES 
        ('Black Sesame Rolls', 2, 12, 3.79, '/images/black-sesame-rolls.jpg', 'Fluffy rolls with nutty sesame flavor.', true),
        ('Pretzels', 2, 25, 2.99, '/images/pretzels.jpg', 'Twisted dough with a salty crust.', true),
        ('Ciabatta', 2, 20, 3.89, '/images/ciabatta.jpg', 'Italian bread with an airy texture.', true),
        ('Whole Wheat Bread', 2, 20, 4.19, '/images/whole-wheat.jpg', 'Hearty and healthy whole grain loaf.', true),
        ('Brioche', 2, 18, 4.69, '/images/brioche.jpg', 'Rich and buttery French bread.', true)
        ON CONFLICT (name) DO NOTHING;
      `);

      console.log("Adding Pastries...");
      await pool.query(`
        INSERT INTO inventory (name, category_id, quantity, price, src, description, isdefault) VALUES 
        ('Croissants', 3, 25, 3.99, '/images/croissants.jpg', 'Flaky, buttery French pastry.', true),
        ('Danish', 3, 20, 3.79, '/images/danish.jpg', 'Pastry with sweet or fruity filling.', false),
        ('Éclairs', 3, 18, 3.99, '/images/eclair.jpg', 'Choux pastry filled with cream and chocolate.', true),
        ('Donut', 3, 30, 2.49, '/images/donut.jpg', 'Fried dough ring, often glazed.', true),
        ('Scones', 3, 20, 3.29, '/images/scones.jpg', 'Crumbly, buttery British treat.', true)
        ON CONFLICT (name) DO NOTHING;
      `);

      // Continue with more queries for each category of products...

      console.log("Product data inserted.");
    } else {
      console.log("Products already exist, skipping insertion.");
    }

    // Verify final counts
    const finalCategoryCheck = await pool.query(
      "SELECT COUNT(*) FROM categories"
    );
    const finalProductCheck = await pool.query(
      "SELECT COUNT(*) FROM inventory"
    );
    console.log(
      `Final categories in database: ${finalCategoryCheck.rows[0].count}`
    );
    console.log(
      `Final products in database: ${finalProductCheck.rows[0].count}`
    );
  } catch (error) {
    console.error("Error during database setup:", error);
  } finally {
    await pool.end();
    console.log("Database setup completed.");
  }
}

// Run the setup
setup();
