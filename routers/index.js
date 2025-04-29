const express = require("express");
const router = express.Router(); // create express router

// create route for the root path that responds to GET requests
router.route("/").get((req, res) => {
  res.render("index", { title: "Sip n Bite" }); // when a GET request is received, renders the index temp, pass an object with title property
});

module.exports = router;
