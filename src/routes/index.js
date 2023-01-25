const auth = require("./auth");
const tutor = require("./tutor");
const student = require("./student");
const admin = require("./admin");
const course = require("./course");
const classs = require("./class");
const report = require("./report");
const news = require("./news");
const resource = require("./resource");
const book = require("./book");
const attendance = require("./attendance");
const quiz = require("./quiz");
const timetable = require("./timetable");

module.exports = (app) => {
    app.get("/", (req, res) => {
        res.status(200).send({message: "Mobile API Leon"});
    });

    app.use("/api/auth", auth);
    app.use("/api/admin", admin);
    app.use("/api/student", student);
    app.use("/api/tutor", tutor);
    app.use("/api/class", classs);
    app.use("/api/course", course);
    app.use("/api/book", book);
    app.use("/api/resource", resource);
    app.use("/api/news", news);
    app.use("/api/report", report);
    app.use("/api/timetable", timetable);
    app.use("/api/quiz", quiz);
    app.use("/api/attendance", attendance);
};
