const express = require("express");
const uploadImage = require("../middlewares/uploadImage");
const Course = require("../controllers/course");

const router = express.Router();

// -------------------------------------------------Courses---------------------------------------------------------------

//GET CourseS
router.get("/getCourseById/:_id", Course.getCourseById);
router.get("/getCourses", Course.getCourses);

//ADD Course
router.post(
    "/addCourse",
    uploadImage.single("coursePicture"),
    Course.addCourse
);

// EDIT Course
router.post(
    "/editCourse/:_id",
    uploadImage.single("coursePicture"),
    Course.editCourse
);

//DELETE Course
router.delete("/deleteCourse/:_id", Course.deleteCourse);

module.exports = router;
