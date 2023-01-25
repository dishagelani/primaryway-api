const express = require("express");

const Timetable = require("../controllers/timetable");

const router = express.Router();

// GET ADMIN
router.get("/getTimetable", Timetable.getTimetable);

module.exports = router;
