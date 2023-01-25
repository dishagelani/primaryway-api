const Admin = require("../models/admin");
const Student = require("../models/student");
const Tutor = require("../models/tutor");

// -------------------------------------------------ADMIN----------------------------------------------------------------

exports.registerAdmin = async (req, res) => {
    try {
        const {email} = req.body;

        const admin = await Admin.findOne({email}).lean().exec();

        if (admin) {
            return res.status(401).json({
                message:
                    "The email address you have entered is already associated with another account.",
            });
        }

        const newAdmin = await new Admin({...req.body}).save();

        if (newAdmin) {
            return res.status(200).json({message: "New admin added."});
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

exports.loginAdmin = async (req, res) => {
    try {
        const {email, pwd} = req.body;

        const admin = await Admin.findOne({email});

        if (!admin) {
            return res.status(401).json({
                message:
                    "The email address you have entered is not associated with any account. Register yourself first.",
            });
        }
        if (!admin.comparePassword(pwd.trim())) {
            return res
                .status(401)
                .json({message: "Invalid login credentials."});
        }

        admin.loginToken = admin.generateJWT();

        await admin.save();

        res.status(200).json({message: "Logged in admin successfully.", admin});
    } catch (e) {
        console.log(e);
        res.status(500).json({message: e.message});
    }
};

// -----------------------------------------Student-----------------------------------------------------------------------

exports.loginStudent = async (req, res) => {
    try {
        const {studentId, password} = req.body;
        let loginUser = {};

        let user = await Student.findOne({studentId});

        if (!user)
            return res.status(401).json({
                message: `Wrong StudentID`,
                user: loginUser,
            });

        if (!user.status) {
            return res.status(401).json({
                message: "Your account is not active. Try again later !",
                user: loginUser,
            });
        }

        if (!user.comparePassword(password))
            return res.status(401).json({
                message: "Please enter correct password",
                user: loginUser,
            });
        user.loginToken = user.generateJWT();
        loginUser = await user.save();
        if (loginUser) {
            res.status(200).json({
                message: "User Logged in successfully.",
                user: loginUser,
            });
        } else {
            res.status(500).json({message: "Something went wrong"});
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// ------------------------------------------------------ TUTOR ----------------------------------------------------------
exports.loginTutor = async (req, res) => {
    try {
        const {tutorId, password} = req.body;
        let loginUser = {};
        let user = await Tutor.findOne({tutorId});

        if (user) {
            if (user.status) {
                if (user.comparePassword(password)) {
                    user.loginToken = user.generateJWT();
                    loginUser = await user.save();
                    if (loginUser) {
                        res.status(200).json({
                            message: "User Logged in successfully.",
                            user: loginUser,
                        });
                    } else {
                        res.status(500).json({
                            message: "Something went wrong",
                        });
                    }
                } else {
                    res.status(401).json({
                        message: "Please enter correct password",
                        user: loginUser,
                    });
                }
            } else {
                res.status(401).json({
                    message: `Your account is not active. Try again later !`,
                    user: loginUser,
                });
            }
        } else {
            res.status(401).json({
                message: `Wrong tutorID`,
                user: loginUser,
            });
        }

        // if (!user)
        //     return res.status(401).json({
        //         message: `Wrong tutorID`,
        //         user: loginUser,
        //     });

        // if (!user.status)
        //     return res.status(401).json({
        //         message: `Your account is not active. Try again later !`,
        //         user: loginUser,
        //     });

        // if (!user.comparePassword(password))
        //     return res.status(401).json({
        //         message: "Please enter correct password",
        //         user: loginUser,
        //     });

        // user.loginToken = user.generateJWT();
        // loginUser = await user.save();
        // if (loginUser) {
        //     res.status(200).json({
        //         message: "User Logged in successfully.",
        //         user: loginUser,
        //     });
        // } else {
        //     res.status(500).json({message: "Something went wrong"});
        // }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};
