const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
        },
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        },
        weeks: Number,
        description: {
            type: String,
            trim: true,
        },
        color: {
            type: String,
            trim: true,
        },
        coursePicture: {
            type: String,
        },
        classes: {type: Array, ref: "Classes"},
        status: Boolean,
        weeks: Number,
        year: Number,
    },
    {timestamps: true}
);

module.exports = mongoose.model("Courses", courseSchema);
