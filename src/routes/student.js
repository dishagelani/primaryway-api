const express = require("express");
const uploadImage = require("../middlewares/uploadImage");
const Student = require("../controllers/student");
const authenticate = require("../middlewares/authenticate");
const router = express.Router();

// GET APIs
router.get("/getStudents", Student.getStudents);
router.get("/getStudentById/:_id", Student.getStudentById);

// ADD APIs
router.post(
    "/addStudent",
    uploadImage.single("studentPicture"),
    Student.addStudent
);

//EDIT APIs
router.post(
    "/editStudent",
    uploadImage.single("studentPicture"),
    Student.editStudent
);

//DELETE APIs
router.delete("/deleteStudent/:_id", Student.deleteStudent);

// SCHEDULE API
// ------------------------------ WIREFRAME ------------------------------------

router.get("/getTodaysSchedule", authenticate, Student.getTodaysSchedule);
router.get("/getClasses", authenticate, Student.getClasses);
router.get("/getClassById/:_id", Student.getClassById);
router.get("/getScheduleOfMonth", authenticate, Student.getScheduleOfMonth);
router.get("/getLesson/:_id/:dateId", Student.getLesson);

// ------------------------------ UI ------------------------------------

router.get("/UIHomeAPI", authenticate, Student.UIHomeAPI);

// router.get("/UIClassAPI/:_id/:dateId", Student.UIClassAPI);
// router.get("/UICourseAPI/:_id", authenticate, Student.UICourseAPI);
module.exports = router;
