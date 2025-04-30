const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");

router.route("/").get(productController.getAllProducts);

// search
router.route("/search").get(productController.search);

// new product

module.exports = router;
