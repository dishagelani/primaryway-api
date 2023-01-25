const express = require("express");
const Book = require("../controllers/book");
const router = express.Router();
const uploadImage = require("../middlewares/uploadImage");
// GET Book
router.get("/getBooks", Book.getBooks);

// ADD Report
router.post("/addBook", uploadImage.single("book"), Book.addBook);

//EDIT Book
router.post("/editBook/:_id", uploadImage.single("book"), Book.editBook);

//DELETE Book
router.delete("/deleteBook/:_id", Book.deleteBook);

module.exports = router;
