const Tutor = require("../models/tutor");
const Student = require("../models/student");
const Code = require("../models/code");
const Admin = require("../models/admin");
const crypto = require("crypto");
const {sendMail} = require("../utils/index");

// ------------------------------------------------ AdMIN---------------------------------------------------------
exports.forgetAdmin = async (req, res) => {
    try {
        const {email} = req.body;

        const user = await Admin.findOne({email});

        if (!user)
            return res.status(401).json({
                message:
                    "This email address is not associated with any account. Double-check your email and try again.",
            });

        const password = crypto.randomBytes(4).toString("hex");


        const subject = "Password reset request";
        const to = email;
        const from = process.env.FROM_EMAIL;
        const html = `<h2>Hello user,</h2>
            <h4>We received a request to reset password for your account. Use this password to login : <b>${password}<b></h4>
           `;

        const mail = await sendMail({to, from, subject, html});

        if (mail) {
            user.password = password;
            await user.save();
            res.status(200).json({
                message: "A new password has been sent to your email.",
            });
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};
exports.changeAdminPassword = async (req, res) => {
    try {
        const _id = req.user._id;
        const {newPassword, currentPassword, confirmPassword} = req.body;

        const admin = await Admin.findOne({_id});

        if (!admin) {
            return res.status(401).json({message: "Unauthorized access !!"});
        }

        if (!admin.comparePassword(currentPassword)) {
            return res
                .status(400)
                .json({message: "Invalid current password !"});
        }

        if (confirmPassword != newPassword) {
            return res.status(400).json({message: "Password do not match!"});
        }

        admin.password = newPassword;
        await admin.save();

        res.status(200).json({message: "Password updated successfully !"});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};

// ------------------------------------------------STUDENT / TUTOR ------------------------------------------------------

// exports.forget = async (req, res) => {
//     try {
//         const {email} = req.body;

//         const user = await User.findOne({email});

//         if (!user)
//             return res.status(401).json({
//                 message:
//                     "The email address " +
//                     req.body.email +
//                     " is not associated with any account. Double-check your email and try again.",
//             });

//         if (!user.isVerified) {
//             return res.status(401).json({
//                 message: "Your account has not been verified yet.",
//             });
//         }

//         const code = await user.generateCode().save();

//         const subject = "Password reset request";
//         const to = email;
//         const from = process.env.FROM_EMAIL;
//         const html = `<p>Hello user,</p>
//             <p>We received a request to reset password for your account. Use this verification code to reset your password <b>${code.code}</b>.</p>
//             <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`;

//         await sendMail({to, from, subject, html});
//         res.status(200).json({
//             message: "A verification code is sent to " + email + ".",
//             code: code.code,
//         });
//     } catch (error) {
//         res.status(500).json({message: error.message});
//     }
// };
exports.forget = async (req, res) => {
    try {
        const {email} = req.body;
        let code = {};

        const student = await Student.findOne({email});

        if (!student) {
            const tutor = await Tutor.findOne({email});
            if (!tutor)
                return res.status(401).json({
                    message:
                        "The email address " +
                        req.body.email +
                        " is not associated with any account. Double-check your email and try again.",
                });
            code = await tutor.generateCode().save();
        } else {
            code = await student.generateCode().save();
        }
        console.log(code, "---code---");
        // const subject = "Password reset request";
        // const to = email;
        // const from = process.env.FROM_EMAIL;
        // const html = `<p>Hello user,</p>
        //     <p>We received a request to reset password for your account. Use this verification code to reset your password <b>${code.code}</b>.</p>
        //     <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`;

        // await sendMail({to, from, subject, html});
        res.status(200).json({
            message: "A verification code is sent to " + email + ".",
            code: code.code,
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

exports.resetRequest = async (req, res) => {
    try {
        const {code} = req.body;
        const verificationCode = await Code.findOne({
            code: code.trim(),
        });

        if (!verificationCode)
            return res.status(401).json({
                message: "Verification code is invalid or has expired.",
            });

        res.status(200).json({
            message: "Code verified",
            userId: verificationCode.userId,
        });
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const {userId} = req.params;
        const student = await Student.findOne({_id: userId});
        const tutor = await Tutor.findOne({_id: userId});
        if (!student && !tutor) {
            return res.status(401).json({
                message: "User not found. Register yourself first.",
            });
        }
        const verificationCode = await Code.findOne({
            userId: student ? student._id : tutor._id,
        });

        if (!verificationCode) {
            return res.status(401).json({
                message: "Verification code not provided to reset password.",
            });
        }

        const strongPassword = new RegExp(
            "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})"
        );

        if (!strongPassword.test(req.body.password.trim())) {
            return res.status(400).json({
                message:
                    "Password should be at least 8 characters long with one uppercase letter, one lowercase letter, one digit and one special character !",
            });
        }
        if (student) {
            student.password = req.body.password;
            await student.save();
        }
        if (tutor) {
            tutor.password = req.body.password;
            await tutor.save();
        }

        await Code.findOneAndRemove({userId});

        res.status(200).json({message: "Your password has been updated."});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};
