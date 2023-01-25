const express = require("express");
const uploadImage = require("../middlewares/uploadImage");
const authenticate = require("../middlewares/authenticate");
const Admin = require("../controllers/admin");

const router = express.Router();

//ADD ADMIN
router.post("/addAdmin", uploadImage.single("adminProfile"), Admin.addAdmin);

//DELETE ADMIN
router.delete("/deleteAdmin/:_id", Admin.deleteAdmin);

// GET ADMIN
router.get("/getAdminDetails", authenticate, Admin.getAdminDetails);
router.get("/getAdmin", Admin.getAdmin);

// EDIT ADMIN DETAILS
router.post("/editAdmin", uploadImage.single("adminProfile"), Admin.editAdmin);
router.post(
    "/editAdminProfile",
    authenticate,
    uploadImage.single("adminProfile"),
    Admin.editAdminProfile
);

module.exports = router;
