const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
    {
        tutor: {
            type: String,
            trim: true,
            ref: "Tutors",
        },
        student: {
            type: String,
            trim: true,
            ref: "Students",
        },
        title: {
            type: String,
            trim: true,
        },
        text: {
            type: String,
            trim: true,
        },
    },
    {timestamps: true}
);

module.exports = mongoose.model("Reports", ReportSchema);
