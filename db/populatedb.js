const { Pool } = require("pg");
require("dotenv").config();

const dropTables =
  process.env.NODE_ENV === "development"
    ? `DROP TABLE IF EXISTS inventory, categories;`
    : ""; // Don't drop tables in production

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
  ('Drinks', '/images/drinks.jpg');`;

const createSQLData = `INSERT INTO inventory (name, category_id, quantity, price, src, description, isdefault) VALUES 
  ('Sourdough', 2, 20, 4.99, '/images/sourdough.jpg', 'Natural fermentation combines for sweet, nutty, and lightly acidic flavors', true),
  ('Baguette', 2, 20, 3.99, '/images/baguette.jpg', 'Classic French bread with a crispy crust.', true),
  ('German Rye', 2, 15, 4.29, '/images/german-rye.jpg', 'Dense rye bread with a rich flavor.', true),
  ('Focaccia', 2, 18, 4.49, '/images/focaccia.jpg', 'Olive oil-rich Italian flatbread.', true),
  ('Challah', 2, 16, 5.49, '/images/challah.jpg', 'Soft braided bread, slightly sweet.', false),
  ('Black Sesame Rolls', 2, 12, 3.79, '/images/black-sesame-rolls.jpg', 'Fluffy rolls with nutty sesame flavor.', true),
  ('Pretzels', 2, 25, 2.99, '/images/pretzels.jpg', 'Twisted dough with a salty crust.', true),
  ('Ciabatta', 2, 20, 3.89, '/images/ciabatta.jpg', 'Italian bread with an airy texture.', true),
  ('Whole Wheat Bread', 2, 20, 4.19, '/images/whole-wheat.jpg', 'Hearty and healthy whole grain loaf.', true),
  ('Brioche', 2, 18, 4.69, '/images/brioche.jpg', 'Rich and buttery French bread.', true),
  ('Corn Bread', 2, 16, 3.59, '/images/corn-bread.jpg', 'Sweet and crumbly Southern-style bread.', true),
  ('Potato Bread', 2, 15, 3.99, '/images/potato-bread.jpg', 'Soft bread made with mashed potatoes.', true),
  ('White Bread', 2, 20, 2.99, '/images/white-bread.jpg', 'Classic soft sandwich bread.', true),

  ('Croissants', 3, 25, 3.99, '/images/croissants.jpg', 'Flaky, buttery French pastry.', true),
  ('Danish', 3, 20, 3.79, '/images/danish.jpg', 'Pastry with sweet or fruity filling.', false),
  ('Éclairs', 3, 18, 3.99, '/images/eclair.jpg', 'Choux pastry filled with cream and chocolate.', true),
  ('Donut', 3, 30, 2.49, '/images/donut.jpg', 'Fried dough ring, often glazed.', true),
  ('Scones', 3, 20, 3.29, '/images/scones.jpg', 'Crumbly, buttery British treat.', true),
  ('Loaf Cake', 3, 16, 4.99, '/images/loaf-cake.jpg', 'Moist cake baked in a loaf pan.', true),
  ('Brownies', 3, 20, 3.59, '/images/brownies.jpg', 'Fudgy or cakey chocolate squares.', true),
  ('Madeleine', 3, 18, 3.49, '/images/madeleine.jpg', 'Shell-shaped French sponge cake.', true),
  ('Canelé', 3, 15, 3.99, '/images/canele.jpg', 'Caramelized crust with custardy center.', true),
  ('Strudel', 3, 12, 4.59, '/images/strudel.jpg', 'Layered pastry filled with fruit.', true),
  ('Cinnamon Rolls', 3, 22, 3.79, '/images/cinnamon-rolls.jpg', 'Sweet rolls swirled with cinnamon.', true),

  ('Coffee Cake', 4, 14, 5.29, '/images/coffee-cake.jpg', 'Crumbly cake perfect with coffee.', true),
  ('Lemon Loaf Cake', 4, 14, 4.99, '/images/lemon-loaf.jpg', 'Tangy lemon cake in loaf form.', false),
  ('Matcha Crepe Cake', 4, 12, 6.99, '/images/matcha-crepe.jpg', 'Layered crepes with matcha cream.', true),
  ('Black Sesame Cheesecake', 4, 10, 6.49, '/images/black-sesame-cheesecake.jpg', 'Creamy cheesecake with sesame flavor.', true),
  ('Cheesecake', 4, 14, 5.99, '/images/cheesecake.jpg', 'Classic creamy dessert.', false),
  ('Matcha Cheesecake', 4, 12, 6.29, '/images/matcha-cheesecake.jpg', 'Cheesecake infused with matcha.', true),
  ('Chocolate Cake', 4, 16, 5.99, '/images/chocolate-cake.jpg', 'Rich and moist chocolate layers.', true),

  ('Espresso', 5, 30, 2.99, '/images/espresso.jpg', 'Strong shot of concentrated coffee.', true),
  ('Americano', 5, 25, 2.99, '/images/americano.jpg', 'Espresso diluted with water.', true),
  ('Latte', 5, 30, 3.99, '/images/latte.jpg', 'Espresso with steamed milk.', true),
  ('Cappuccino', 5, 25, 3.99, '/images/cappucino.jpg', 'Espresso with steamed milk foam.', true),
  ('Mocha', 5, 20, 4.29, '/images/mocha.jpg', 'Espresso with chocolate and milk.', false),
  ('Affogato', 5, 10, 4.49, '/images/affogato.jpg', 'Espresso over vanilla ice cream.', true),
  ('Matcha Latte', 5, 25, 4.29, '/images/matcha-latte.jpg', 'Green tea with steamed milk.', true),
  ('Black Sesame Latte', 5, 15, 4.49, '/images/black-sesame-latte.jpg', 'Nutty sesame drink with milk.', true),
  ('Ube Latte', 5, 15, 4.49, '/images/ube-latte.jpg', 'Purple yam latte with a sweet note.', true),
  ('Pistachio Cream Latte', 5, 15, 4.79, '/images/pistachio-cream-latte.jpg', 'Nutty latte with pistachio cream.', false),
  ('Lavender Latte', 5, 15, 4.59, '/images/lavender-latte.jpg', 'Floral latte with calming aroma.', true),
  ('Chai Latte', 5, 25, 4.19, '/images/chai-latte.jpg', 'Spiced tea with milk.', true),
  ('Hojicha Latte', 5, 15, 4.29, '/images/hojicha-latte.jpg', 'Roasted green tea latte.', true),
  ('Dalgona Coffee', 5, 18, 4.29, '/images/dalgona-coffee.jpg', 'Whipped instant coffee on milk.', true)`;

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

    // Only drop tables if not in production
    if (process.env.NODE_ENV !== "production") {
      await pool.query(dropTables);
      console.log("Tables dropped.");
    } else {
      console.log("Skipping table drop in production environment.");
    }

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
