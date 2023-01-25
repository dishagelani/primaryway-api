const express = require("express");
const News = require("../controllers/news");
const router = express.Router();
const uploadImage = require("../middlewares/uploadImage");
// GET News
router.get("/getNews", News.getNews);
router.get("/getNewsById/:_id", News.getNewsById);

// ADD Report
router.post("/addNews", uploadImage.single("news"), News.addNews);

//EDIT News
router.post("/editNews/:_id", uploadImage.single("news"), News.editNews);

//DELETE News
router.delete("/deleteNews/:_id", News.deleteNews);

module.exports = router;
