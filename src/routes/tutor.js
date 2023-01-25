const express = require("express");
const uploadImage = require("../middlewares/uploadImage");
const authenticate = require("../middlewares/authenticate");
const Tutor = require("../controllers/tutor");

const router = express.Router();

//GET TUTOR
router.get("/getTutorDetails", authenticate, Tutor.getTutorDetails);
router.get("/getTutorById/:_id", Tutor.getTutorById);
router.get("/getTutors", Tutor.getTutors);

//ADD TUTOR
router.post("/addTutor", uploadImage.single("tutorPicture"), Tutor.addTutor);

//EDIT TUTOR
router.post("/editTutor", uploadImage.single("tutorPicture"), Tutor.editTutor);

router.post(
    "/setupTutorProfile",
    authenticate,
    uploadImage.single("tutorPicture"),
    Tutor.setupTutorProfile
);

//DELETE TUTOR
router.delete("/deleteTutor/:_id", Tutor.deleteTutor);

//SCHEDULE API

// ------------------------- WIREFRAME -------------------------------------
router.get("/getClasses", authenticate, Tutor.getClasses);
router.get("/getTodaysSchedule", authenticate, Tutor.getTodaysSchedule);
router.get("/getClassById/:_id", Tutor.getClassById);
router.get("/getScheduleOfMonth", authenticate, Tutor.getScheduleOfMonth);
router.get("/getLesson/:_id/:dateId", Tutor.getLesson);

// ------------------------- UI -------------------------------------
router.get("/UIHomeApi", authenticate, Tutor.UIHomeApi);
router.get("/UIClassAPI/:_id/:dateId", Tutor.UIClassAPI);
router.get("/UICourseAPI/:_id", authenticate, Tutor.UICourseAPI);

module.exports = router;
