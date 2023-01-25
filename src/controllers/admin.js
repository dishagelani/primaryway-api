const Admin = require("../models/admin");
const fs = require("fs");

exports.addAdmin = async (req, res) => {
    try {
        const {email} = req.body;

        const existingEmail = await Admin.findOne({email});

        let adminProfile = undefined;
        if (existingEmail) {
            return res.status(422).json({
                message:
                    "The email address you have entered is already associated with other account !",
            });
        }
        if (req.file) {
            adminProfile =
                process.env.TYPE === "DEVELOPMENT"
                    ? `http://localhost:3000/admin_profile_pictures/` +
                      req.file.filename.replace(/\s/g, "")
                    : `${process.env.PRODUCTION_URL}/admin_profile_pictures/` +
                      req.file.filename.replace(/\s/g, "");
        }

        const newAdmin = await new Admin({...req.body, adminProfile}).save();

        console.log(newAdmin);
        if (!newAdmin) {
            return res.status(500).json({message: "Something went wrong !"});
        }
        res.status(200).json({message: "New user added !"});
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Something went wrong !"});
    }
};

exports.editAdmin = async (req, res) => {
    try {
        const {email, _id} = req.body;

        const existingEmail = await Admin.findOne({
            email,
            _id: {$ne: _id},
        });

        if (existingEmail) {
            return res.status(422).json({
                message:
                    "The email address you have entered is already associated with other account !",
            });
        }

        const editadmin = await Admin.findOne({_id});
        let adminProfile = editadmin.adminProfile;

        Object.keys(req.body).forEach(function (key) {
            if (req.body[key]) editadmin[key] = req.body[key];
        });

        if (req.file) {
            editadmin.adminProfile =
                process.env.TYPE === "DEVELOPMENT"
                    ? `http://localhost:3000/admin_profile_pictures/` +
                      req.file.filename.replace(/\s/g, "")
                    : `${process.env.PRODUCTION_URL}/admin_profile_pictures/` +
                      req.file.filename.replace(/\s/g, "");
        }

        const updateAdmin = await editadmin.save();

        if (updateAdmin) {
            console.log(updateAdmin);
            if (req.file && adminProfile) {
                fs.unlinkSync(
                    `src/public/admin_profile_pictures/${adminProfile
                        .split("/")
                        .pop()}`
                );
            }
            res.status(200).json({message: "User details updated !"});
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Something went wrong !"});
    }
};
exports.deleteAdmin = async (req, res) => {
    try {
        const {_id} = req.params;

        const deleteAdmin = await Admin.findOneAndDelete({_id});
        if (deleteAdmin) {
            if (deleteAdmin.adminProfile) {
                fs.unlinkSync(
                    `src/public/admin_profile_pictures/${deleteAdmin.adminProfile
                        .split("/")
                        .pop()}`
                );
            }
            res.status(200).json({message: "User deleted !"});
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Something went wrong"});
    }
};
exports.editAdminProfile = async (req, res) => {
    try {
        console.log(req.file);
        const adminId = req.user._id;
        const {email, phoneNumber} = req.body;

        const adminWithEmail = await Admin.findOne({
            email,
            _id: {$ne: adminId},
        });

        if (adminWithEmail) {
            return res.status(401).json({
                message:
                    "The email address you have entered is already associated with another account !",
            });
        }

        if (phoneNumber) {
            const adminWithPhonenumber = await Admin.findOne({
                phoneNumber,
                _id: {$ne: adminId},
            });

            if (adminWithPhonenumber) {
                return res.status(401).json({
                    message:
                        "The phone number you have entered is already associated with another account !",
                });
            }
        }

        const admin = await Admin.findOne({_id: adminId});
        let adminProfile = admin.adminProfile;

        if (req.file) {
            adminProfile =
                process.env.TYPE === "DEVELOPMENT"
                    ? `http://localhost:3000/admin_profile_pictures/` +
                      req.file.filename.replace(/\s/g, "")
                    : `${process.env.PRODUCTION_URL}/admin_profile_pictures/` +
                      req.file.filename.replace(/\s/g, "");
        }

        const updateAdmin = await Admin.findOneAndUpdate(
            {_id: adminId},
            {...req.body, adminProfile}
        );

        console.log("updateAdmin", updateAdmin);
        if (updateAdmin) {
            if (req.file && admin.adminProfile) {
                fs.unlinkSync(
                    `src/public/admin_profile_pictures/${admin.adminProfile
                        .split("/")
                        .pop()}`
                );
            }
        }
        res.status(200).json({
            message: "Admin profile updated successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
};

exports.getAdminDetails = async (req, res) => {
    try {
        const _id = req.user._id;
        const admin = await Admin.findOne(
            {_id},
            {__v: 0, createdAt: 0, updatedAt: 0, loginToken: 0, password: 0}
        );

        res.status(200).json({admin});
    } catch (e) {
        res.status(500).json({message: "something went wrong !"});
    }
};

exports.getAdmin = async (req, res) => {
    try {
        const admins = await Admin.find(
            {},
            {__v: 0, createdAt: 0, updatedAt: 0, loginToken: 0}
        );

        res.status(200).json({admins});
    } catch (e) {
        res.status(500).json({message: e});
    }
};
