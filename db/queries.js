const pool = require("./pool");

async function getAllProducts(query = null) {
  try {
    // if filter applied
    if (query) {
      return filterProducts(query);
    }
    const { rows } = await pool.query(
      "SELECT inventory.*, categories.category, categories.src AS category_src FROM inventory JOIN categories ON category_id = categories.id;"
    );
    return rows;
  } catch (err) {
    console.error(err);
    return [];
  }
}
// get all categories
async function getCategories() {
  const { rows } = await pool.query(
    "SELECT * FROM categories ORDER BY category ASC;"
  );

  return rows;
}

// get category id by name
async function getCategoryIdByName(categoryName) {
  const { rows } = await pool.query(
    `SELECT id FROM categories WHERE category = $1`, // just a placeholder
    [categoryName]
  );
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
    throw new Error("invalid category");
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

module.exports = {
  getAllProducts,
  getCategories,
  getCategoryIdByName,
  addCategory,
  addProductToDb,
  deleteProduct,
  deleteCategory,
  editProduct,
  filterById,
  search,
};
