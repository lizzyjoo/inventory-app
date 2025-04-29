const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");

router.route("/").get(categoryController.getAllCategories);
router
  .route("/new")
  .get(categoryController.newCategoryGet)
  .post(categoryController.newCategoryPost);

router.route("/delete/:category").post(categoryController.deleteCategoryPost);

module.exports = router;
