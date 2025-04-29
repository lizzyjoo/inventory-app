db = require("../db/queries");

async function getAllProducts(req, res) {
  const products = await db.getAllProducts();
  console.log("Products from database:", products);

  res.render("products", {
    title: "Products",
    products,
  });
}

module.exports = {
  getAllProducts,
};
