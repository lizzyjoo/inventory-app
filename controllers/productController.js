db = require("../db/queries");

async function getAllProducts(req, res) {
  const products = await db.getAllProducts();
  console.log("Products from database:", products);

  res.render("products", {
    title: "Products",
    products,
  });
}

async function showProduct(req, res) {
  const id = req.params.id;
  const products = await db.filterById(id);

  res.render("viewProduct", { product: products });
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
module.exports = {
  getAllProducts,
  search,
};
