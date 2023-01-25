const multer = require("multer");
const fs = require("fs");
const path = require("path");

const imageStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        if (file.fieldname == "adminProfile") {
            const imageDir = path.join(
                __dirname,
                "..",
                "public",
                "admin_profile_pictures"
            );
            if (fs.existsSync(imageDir)) {
                cb(null, imageDir);
            } else {
                fs.mkdirSync(imageDir, {recursive: true});
                cb(null, imageDir);
            }
        }
        if (file.fieldname == "studentPicture") {
            const imageDir = path.join(
                __dirname,
                "..",
                "public",
                "student_profile_pictures"
            );
            if (fs.existsSync(imageDir)) {
                cb(null, imageDir);
            } else {
                fs.mkdirSync(imageDir, {recursive: true});
                cb(null, imageDir);
            }
        }
        if (file.fieldname == "tutorPicture") {
            const imageDir = path.join(
                __dirname,
                "..",
                "public",
                "tutor_profile_pictures"
            );
            if (fs.existsSync(imageDir)) {
                cb(null, imageDir);
            } else {
                fs.mkdirSync(imageDir, {recursive: true});
                cb(null, imageDir);
            }
        }
        if (file.fieldname == "coursePicture") {
            const imageDir = path.join(
                __dirname,
                "..",
                "public",
                "course_pictures"
            );
            if (fs.existsSync(imageDir)) {
                cb(null, imageDir);
            } else {
                fs.mkdirSync(imageDir, {recursive: true});
                cb(null, imageDir);
            }
        }
        if (file.fieldname == "news") {
            const imageDir = path.join(__dirname, "..", "public", "news");
            if (fs.existsSync(imageDir)) {
                cb(null, imageDir);
            } else {
                fs.mkdirSync(imageDir, {recursive: true});
                cb(null, imageDir);
            }
        }
        if (file.fieldname == "book") {
            const imageDir = path.join(__dirname, "..", "public", "books");
            if (fs.existsSync(imageDir)) {
                cb(null, imageDir);
            } else {
                fs.mkdirSync(imageDir, {recursive: true});
                cb(null, imageDir);
            }
        }
        if (file.fieldname == "resource") {
            const imageDir = path.join(__dirname, "..", "public", "resources");
            if (fs.existsSync(imageDir)) {
                cb(null, imageDir);
            } else {
                fs.mkdirSync(imageDir, {recursive: true});
                cb(null, imageDir);
            }
        }
    },

    filename: async function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const uploadImage = multer({
    storage: imageStorage,
    fileFilter: (req, file, cb) => {
        const fileType = /jpeg|jpg|png/;
        const extension = file.originalname.substring(
            file.originalname.lastIndexOf(".") + 1
        );
        const mimetype = fileType.test(file.mimetype);

        if (mimetype && extension) {
            return cb(null, true);
        } else {
            cb("You can upload only Image file");
        }
    },
});

module.exports = uploadImage;
