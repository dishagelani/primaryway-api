const multer = require("multer");

const uploadImage = multer({
    storage: multer.memoryStorage(),
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
