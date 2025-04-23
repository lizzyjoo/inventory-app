const { Client } = require("pg");
require("dotenv").config();

const dropTables = `DROP TABLE IF EXISTS inventory, categories;`;

const createSQLTable = `CREATE TABLE IF NOT EXISTS inventory (id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY, name VARCHAR(50) UNIQUE, category_id INTEGER, quantity INTEGER, price DECIMAL(5, 2), src TEXT DEFAULT '/images/default.svg', description VARCHAR(200), isDefault BOOLEAN);`;

const createSQLData = `INSERT INTO inventory (name,category_id,quantity,price,src,description,isdefault) VALUES ('Sourdough', 2, 20, 4.99, './images/sourdough.jpg', 'natural fermentation combine for sweet, nutty, and lightly acidic flavors', true)`;

const createCategoriesTable = `CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY, category VARCHAR(50) UNIQUE, color TEXT UNIQUE)`;

const createCategories = `INSERT INTO categories (category, color) VALUES ('Uncategorized', '#fefefe'), ('Bread', '#fefefe'), ('Pastry','#fefefe'), ('Cake', '#fefefe'), ('Drink', '#fefefe');`;

async function main() {
  console.log("seeding...");
  const client = new Client({
    connectionString: process.env.RENDER_URL || process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  try {
    await client.connect();
    console.log("Connected to database.");
    await client.query(dropTables);
    await client.query(createCategoriesTable);
    await client.query(createSQLTable);
    console.log("Tables created.");
    await client.query(createCategories);
    await client.query(createSQLData);
    console.log("Data created.");
  } catch (error) {
    console.log("error");
  } finally {
    await client.end();
    console.log("Done.");
  }
}

main();
