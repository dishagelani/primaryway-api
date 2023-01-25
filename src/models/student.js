const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Code = require("../models/code");

const StudentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
        },
        surname: {
            type: String,
            trim: true,
        },
        dob: {
            type: Date,
            trim: true,
        },
        parentName: {
            type: String,
            trim: true,
        },
        parentSurname: {
            type: String,
            trim: true,
        },
        phoneNumber: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
        },
        password: {
            type: String,
            trim: true,
        },
        studentId: {
            type: String,
            unique: true,
        },
        profilePicture: {
            type: String,
        },
        status: {
            type: Boolean,
        },
        loginToken: {
            type: String,
        },
    },
    {timestamps: true}
);

StudentSchema.pre("save", function (next) {
    const user = this;

    if (!user.isModified("password")) return next();

    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

StudentSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

StudentSchema.methods.generateJWT = function () {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    let payload = {
        id: this._id,
        email: this.email,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: parseInt(expirationDate.getTime() / 1000, 10),
    });
};

StudentSchema.methods.generatePasswordReset = function () {
    this.resetPasswordToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};

StudentSchema.methods.generateCode = function () {
    let payload = {
        userId: this._id,
        code: Math.floor(1000 + Math.random() * 9000),
    };

    return new Code(payload);
};

module.exports = mongoose.model("Students", StudentSchema);
