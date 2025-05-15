db = require("../db/queries");

async function getAllProducts(req, res) {
  const products = await db.getAllProducts();
  const categories = await db.getCategories();
  console.log("Products from database:", products);

  res.render("products", {
    title: "Products",
    products,
    listedCategories: categories,
    selectedCategory: req.query.category,
    sort: req.query.sort,
  });
}

// product specific page
async function showProduct(req, res) {
  try {
    const id = req.params.id;
    const product = await db.filterById(id);

    if (!product) {
      return res.status(404).render("404");
    }

    res.render("viewProduct", {
      title: product.name,
      product: product,
    });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).send("Error loading product details");
  }
}

// use get, data is appended to the URL as query parameters
async function search(req, res) {
  console.log("Search function called");
  console.log("Query parameters:", req.query);

  const query = req.query.query; // Using req.query instead of req.body
  if (!query) {
    return res.render("search", { title: "Search", query: "", products: [] });
  }

  const results = await db.search(query);
  console.log("Search results:", results);

  res.render("search", { title: "Search", query, products: results });
}

async function addProduct(req, res) {
  const listedCategories = await db.getCategories();

  res.render("newProduct", listedCategories);
}

async function deleteProduct(req, res) {
  const id = req.params.id;

  await db.deleteProduct(id);

  res.redirect("/products");
}

async function addProductToDb(req, res) {
  const newProduct = {
    name: req.body.name,
    quantity: req.body.quantity,
    price: req.body.price,
    src: req.file ? `/uploads/${req.file.filename}` : "/images/default.svg",
    description: req.body.description,
    isDefault: false,
  };

  try {
    await db.addProductToDb(newProduct);
    res.redirect("/products");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding product to database.");
  }
}

async function editProductGet(req, res) {
  const id = req.params.id;
  const products = await db.filterById(id);
  const listedCategories = await db.getCategories();
  const selectedCategory = products.category;

  res.render("editProduct", {
    title: `Edit '${products.name}'`,
    product: products,
    listedCategories,
    selectedCategory,
  });
}

async function editProductPost(req, res) {
  const id = req.params.id;
  console.log("Edit Post - ID:", id);
  console.log("Edit Post - Form data:", req.body);
  console.log("Edit Post - File:", req.file);

  let src;
  if (req.file) {
    src = `/uploads/${req.file.filename}`;
    console.log("Edit Post - New src:", src);
  }

  try {
    const { name, quantity, price, category, brand, description } = req.body;

    // Create an edit object with only the fields that are provided
    const editData = {
      id,
      ...(name && { name }),
      ...(quantity && { quantity }),
      ...(price && { price }),
      ...(category && { category }),
      ...(brand && { brand }),
      ...(src && { src }),
      ...(description && { description }),
    };

    console.log("Edit Post - Data being sent to DB:", editData);

    await db.editProduct(editData);
    res.redirect(`/products/${id}`);
  } catch (err) {
    console.error("Error in editProductPost:", err);
    res.status(500).send("Error updating product");
  }
}

module.exports = {
  getAllProducts,
  search,
  showProduct,
  addProduct,
  deleteProduct,
  editProductGet,
  editProductPost,
  addProductToDb,
};
