const pool = require("./pool");

async function getAllProducts() {
  return getFilteredAndSortedProducts();
}
// get all categories
async function getCategories() {
  const { rows } = await pool.query(
    "SELECT * FROM categories ORDER BY category ASC;"
  );

  return rows;
}

async function getFilteredAndSortedProducts(options = {}) {
  try {
    const { category = null, sortBy = "name", sortOrder = "ASC" } = options;

    let query = `
      SELECT inventory.*, categories.category 
      FROM inventory 
      JOIN categories ON inventory.category_id = categories.id
    `;

    const queryParams = [];
    let paramIndex = 1;

    // Add WHERE clause if category filter is provided
    if (category) {
      query += ` WHERE categories.category = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }

    // Add ORDER BY clause based on sortBy parameter
    if (sortBy === "price") {
      query += ` ORDER BY inventory.price ${sortOrder}`;
    } else if (sortBy === "name") {
      query += ` ORDER BY inventory.name ${sortOrder}`;
    }

    const { rows } = await pool.query(query, queryParams);
    return rows;
  } catch (err) {
    console.error("Database query error:", err);
    return [];
  }
}
async function getProductsByCategory(category) {
  return getFilteredAndSortedProducts({ category });
}

// get category id by name
async function getCategoryIdByName(categoryName) {
  const { rows } = await pool.query(
    `SELECT id FROM categories WHERE category = $1`,
    [categoryName]
  );

  // Check if a category was found
  if (rows.length === 0 || !rows[0]) {
    console.error(`Category not found: ${categoryName}`);
    return null; // Return null instead of trying to access .id on undefined
  }

  return rows[0].id;
}
async function addCategory(newCategory) {
  const result = await pool.query(
    "INSERT INTO categories (category, src) VALUES ($1, $2);",
    [newCategory.category, newCategory.src]
  );
  return result.rowCount > 0; // Returns true if insertion was successful
}

async function addProductToDb(newProduct) {
  const categoryID = await getCategoryIdByName(newProduct.category);
  if (!categoryID) {
    throw new Error(`Invalid category: ${newProduct.category}`);
  }

  await pool.query(
    "INSERT into inventory ( name, quantity, price, description, category_id, src, isDefault) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [
      newProduct.name,
      newProduct.quantity,
      newProduct.price,
      newProduct.description,
      categoryID,
      newProduct.src,
      false,
    ]
  );
}

async function deleteProduct(id) {
  await pool.query(
    "DELETE FROM inventory WHERE id = $1 AND isDefault = false",
    [id]
  );
}
async function filterById(id) {
  const { rows } = await pool.query(
    "SELECT inventory.*, categories.category, categories.src AS category_src FROM inventory JOIN categories ON inventory.category_id = categories.id WHERE inventory.id = $1",
    [id]
  );

  const newRows = rows.map((row) => {
    return { ...row };
  });
  return newRows[0];
}

// when a category is deleted, all the products in that category will be shifted to "uncategorized"
// first reallocate products, then delete the category
async function deleteCategory(category) {
  const defaultCategoryID = 1;
  const categoryID = await getCategoryIdByName(category);
  await pool.query(
    "UPDATE inventory SET category_id = $1 WHERE category_id = $2 and isDefault = false;",
    [defaultCategoryID, categoryID]
  );

  await pool.query("DELETE FROM categories WHERE category = $1", [category]);
}

async function editProduct({
  id,
  name,
  quantity,
  price,
  category,
  src,
  description,
}) {
  const updates = []; // collect field updates e.g. ["name = $1", "price = $2", "quantity = $3"]
  const values = []; // collect values
  let index = 1;
  if (category) {
    const categoryId = await getCategoryIdByName(category);
    if (categoryId) {
      // Check if categoryId exists
      updates.push(`category_id = $${index++}`);
      values.push(categoryId);
    } else {
      console.warn(`Category not found: ${category}, skipping category update`);
      // Handle error or continue without updating category
    }
  }

  if (name) {
    updates.push(`name = $${index++}`);
    values.push(name);
  }

  if (quantity) {
    updates.push(`quantity = $${index++}`);
    values.push(quantity);
  }
  if (price) {
    updates.push(`price = $${index++}`);
    values.push(price);
  }

  if (category) {
    const categoryId = await getCategoryIdByName(category);
    if (categoryId) {
      updates.push(`category_id = $${index++}`);
      values.push(categoryId);
    } else {
      throw new Error("Invalid category.");
    }
  }

  if (src) {
    updates.push(`src = $${index++}`);
    values.push(src);
  }
  if (description) {
    updates.push(`description = $${index++}`);
    values.push(description);
  }

  if (updates.length > 0) {
    const query = `UPDATE inventory SET ${updates.join(
      ", "
    )} WHERE id = $${index}`;
    values.push(id);
    await pool.query(query, values);
  }
}

async function search(query) {
  const searchTerm = `%${query}%`;
  const { rows } = await pool.query(
    "SELECT inventory.*, categories.category, categories.src AS category_src FROM inventory JOIN categories ON inventory.category_id = categories.id WHERE inventory.name ILIKE $1",
    [searchTerm]
  );

  return rows;
}

async function sortByPrice(order = "ASC", categoryFilter = null) {
  try {
    let query;
    let params;

    if (categoryFilter) {
      query = `
      SELECT inventory.*, categories.category
      FROM inventory
      JOIN categories ON inventory.category_id = categories.id
      WHERE categories.category = $1
      ORDER BY inventory.price ${order === "DESC" ? "DESC" : "ASC"}
      `;
      params = [categoryFilter];
    } else {
      // Sort all products
      query = `
        SELECT inventory.*, categories.category 
        FROM inventory 
        JOIN categories ON inventory.category_id = categories.id 
        ORDER BY inventory.price ${order === "DESC" ? "DESC" : "ASC"}
      `;
    }
    const { rows } = await pool.query(query, params);
    return rows;
  } catch (err) {
    console.error("Error sorting products by price:", err);
    return [];
  }
}

async function sortByName(order = "ASC", categoryFilter = null) {
  try {
    let query;
    let params = [];

    if (categoryFilter) {
      // If category filter is provided, include it in the query
      query = `
        SELECT inventory.*, categories.category 
        FROM inventory 
        JOIN categories ON inventory.category_id = categories.id 
        WHERE categories.category = $1
        ORDER BY inventory.name ${order === "DESC" ? "DESC" : "ASC"}
      `;
      params = [categoryFilter];
    } else {
      // Sort all products
      query = `
        SELECT inventory.*, categories.category 
        FROM inventory 
        JOIN categories ON inventory.category_id = categories.id 
        ORDER BY inventory.name ${order === "DESC" ? "DESC" : "ASC"}
      `;
    }

    const { rows } = await pool.query(query, params);
    return rows;
  } catch (err) {
    console.error("Error sorting products by name:", err);
    return [];
  }
}

module.exports = {
  getAllProducts,
  getCategories,
  getCategoryIdByName,
  getProductsByCategory,
  addCategory,
  addProductToDb,
  deleteProduct,
  deleteCategory,
  editProduct,
  filterById,
  search,
  sortByPrice,
  sortByName,
};
