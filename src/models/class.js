const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
    {
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Courses",
        },
        className: {
            type: String,
            trim: true,
        },
        tutor: {
            type: String,
            trim: true,
            ref: "Tutors",
        },
        students: {type: Array, ref: "Students"},

        classSchedule: [
            {
                date: Date,
                time: Array,
                present: Array,
                absent: Array,
                completed: {type: Boolean, default: false},
            },
        ],
        quizSchedule: [
            {
                name: {type: String, trim: true},
                date: Date,
                time: Array,
                present: Array,
                absent: Array,
                completed: {type: Boolean, default: false},
            },
        ],
    },
    {timestamps: true}
);

module.exports = mongoose.model("Classes", classSchema);
