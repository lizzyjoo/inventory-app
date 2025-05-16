db = require("../db/queries");

async function getAllProducts(req, res) {
  try {
    const categoryFilter = req.query.category;
    const sortBy = req.query.sortBy || ""; // Default empty string
    const order = req.query.order || "ASC"; // Default to ascending order

    console.log("Request params:", { categoryFilter, sortBy, order });

    // Get all categories for the dropdown
    const categories = await db.getCategories();

    let products = [];

    // Determine which function to use based on parameters
    if (sortBy === "price") {
      // Check if function exists first
      if (typeof db.sortByPrice === "function") {
        products = await db.sortByPrice(order, categoryFilter);
      } else {
        products = await db.getAllProducts();
        console.warn(
          "sortByPrice function not defined, using getAllProducts instead"
        );
      }
    } else if (sortBy === "name") {
      // Check if function exists first
      if (typeof db.sortByName === "function") {
        products = await db.sortByName(order, categoryFilter);
      } else {
        products = await db.getAllProducts();
        console.warn(
          "sortByName function not defined, using getAllProducts instead"
        );
      }
    } else if (categoryFilter) {
      products = await db.getProductsByCategory(categoryFilter);
    } else {
      products = await db.getAllProducts();
    }

    console.log(`Found ${products.length} products`);

    res.render("products", {
      title: "Products",
      products,
      categories,
      selectedCategory: categoryFilter || "",
      sortBy: sortBy, // Make sure to pass sortBy
      order: order, // Make sure to pass order
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Error loading products");
  }
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
  console.log("addProduct function called!");
  try {
    // Fetch categories for the dropdown
    const listedCategories = await db.getCategories();

    // Render the newProduct template with categories
    res.render("newProduct", {
      title: "Add New Product",
      listedCategories: listedCategories,
    });
  } catch (error) {
    console.error("Error loading add product form:", error);
    res.status(500).send("Error loading add product form");
  }
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
