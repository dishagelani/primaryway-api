const mongoose = require("mongoose");

const codeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    code: {
        type: String,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});
codeSchema.index({createdAt: 1}, {expireAfterSeconds: 300}); //Expires in 5 minutes
module.exports = mongoose.model("Codes", codeSchema);
