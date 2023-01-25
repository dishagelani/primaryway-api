const express = require("express");
const Resource = require("../controllers/resource");
const router = express.Router();
const uploadImage = require("../middlewares/uploadImage");
// GET Resource
router.get("/getResources", Resource.getResources);

// ADD Report
router.post(
    "/addResource",
    uploadImage.single("resource"),
    Resource.addResource
);

//EDIT Resource
router.post(
    "/editResource/:_id",
    uploadImage.single("resource"),
    Resource.editResource
);

//DELETE Resource
router.delete("/deleteResource/:_id", Resource.deleteResource);

module.exports = router;
