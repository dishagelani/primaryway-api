const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema(
    {
        title: {type: String, trim: true},
        text: {type: String, trim: true},
        image: String,
    },
    {timestamps: true}
);

module.exports = mongoose.model("News", NewsSchema);
