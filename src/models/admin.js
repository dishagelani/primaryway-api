const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const AdminSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            trim: true,
        },
        password: {
            type: String,
        },
        name: {
            type: String,
            trim: true,
        },
        surname: {
            type: String,
            trim: true,
        },
        username: {
            type: String,
            trim: true,
        },
        phoneNumber: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },

        adminProfile: {
            type: String,
        },
        status: Boolean,
        role: {
            type: String,
            trim: true,
        },
        loginToken: {
            type: String,
        },
    },
    {timestamps: true}
);

AdminSchema.pre("save", function (next) {
    const admin = this;

    if (!admin.isModified("password")) return next();

    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(admin.password, salt, function (err, hash) {
            if (err) return next(err);

            admin.password = hash;
            next();
        });
    });
});

AdminSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

AdminSchema.methods.generateJWT = function () {
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

module.exports = mongoose.model("Admin", AdminSchema);
