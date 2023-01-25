const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
    {
        course: {type: String, ref: "Courses"},
        title: {type: String, trim: true},
        text: {type: String, trim: true},
        image: String,
    },
    {timestamps: true}
);

module.exports = mongoose.model("Book", BookSchema);
