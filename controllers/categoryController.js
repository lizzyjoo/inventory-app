db = require("../db/queries");

async function getAllCategories(req, res) {
  const getCategories = await db.getCategories();

  const listedCategories = getCategories.filter(
    (cat) => cat.category !== "Uncategorized"
  ); // array?

  res.render("categories", {
    title: "Categories",
    listedCategories,
  });
}

// for creating a new category
async function newCategoryGet(req, res) {
  res.render("newCategory", { title: "Add a Category" });
}

async function newCategoryPost(req, res) {
  const input = {
    category: req.body.category,
    color: req.body.color,
  };
  try {
    await db.addCategory(input);
    res.redirect("/categories");
  } catch (err) {
    res.status(500).send("Error adding category to database.");
  }
}

async function deleteCategoryPost(req, res) {
  const category = req.params.category;
  try {
    await db.deleteCategory(category);
    res.redirect("/categories");
  } catch (err) {
    res.status(500).send("Error deleting category.", err);
  }
}

module.exports = {
  getAllCategories,
  newCategoryGet,
  newCategoryPost,
  deleteCategoryPost,
};
