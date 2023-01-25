const express = require("express");
const Report = require("../controllers/report");
const router = express.Router();
const authentication = require("../middlewares/authenticate");

// GET Reports
router.get("/getReports", Report.getReports);
router.get("/getReportsForTutor", authentication, Report.getReportsForTutor);
router.get("/getStudentReport", authentication, Report.getStudentReport);
router.get("/getReportById/:_id", Report.getReportById);

// ADD Report
router.post("/addReport", authentication, Report.addReport);

//EDIT Report
router.post("/editReport/:_id", Report.editReport);

//DELETE Report
router.delete("/deleteReport/:_id", Report.deleteReport);

module.exports = router;
