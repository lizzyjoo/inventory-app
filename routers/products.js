const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");

const { upload } = require("../controllers/uploadMiddleWare");

router.route("/").get(productController.getAllProducts);

// search
router.route("/search").get(productController.search);

router.get("/:id", productController.showProduct);
// new product
router
  .route("/new")
  .get(productController.addProduct)
  .post(upload.single("src"), productController.addProductToDb);

// show product details
router.route("/:id").get(productController.showProduct);

// edit product details

router
  .route("/edit/:id")
  .get(productController.editProductGet)
  .post(upload.single("src"), productController.editProductPost);

module.exports = router;
