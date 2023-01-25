const express = require("express");
const Attendance = require("../controllers/attendance");

const router = express.Router();

// GET AttendanceS
// router.get("/getAttendances", Attendance.getAttendances);
// router.get("/getAttendanceById/:_id", Attendance.getAttendanceById);

// ADD Attendance
router.post("/addAttendance", Attendance.addAttendance);
router.post("/UIAddAttendance", Attendance.UIAddAttendance);

module.exports = router;
