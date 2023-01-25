const express = require("express");
const Class = require("../controllers/class");
const router = express.Router();

//ADD
router.post("/addClass", Class.addClass);
router.post("/addDateToClass", Class.addDateToClass);
router.post("/addStudentToClass", Class.addStudentToClass);

//GET
router.get("/getClassById/:_id", Class.getClassById);

//EDIT
router.post("/editClass/:_id", Class.editClass);
router.post("/editDateInClass", Class.editDateInClass);

//DELETE
router.delete("/deleteClass/:_id/:classId", Class.deleteClass);
router.delete("/deleteDateFromClass/:_id/:dateId", Class.deleteDateFromClass);
router.delete(
    "/deleteStudentFromClass/:_id/:studentId",
    Class.deleteStudentFromClass
);

module.exports = router;
