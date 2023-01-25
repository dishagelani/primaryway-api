const express = require("express");
const {check} = require("express-validator");
const Auth = require("../controllers/auth");
const Password = require("../controllers/password");
const validate = require("../middlewares/validate");
const authenticate = require("../middlewares/authenticate");
const router = express.Router();

router.get("/", (req, res) => {
    res.status(200).json({
        message:
            "You are in the Auth Endpoint. Register or Login to test Authentication.",
    });
});

// -----------------------------------ADMIN------------------------------------------------------

// REGISTER USER
router.post("/registerAdmin", Auth.registerAdmin);

// LOGIN USER
router.post("/loginAdmin", Auth.loginAdmin);

// FORGET
router.post("/forgetAdmin", Password.forgetAdmin);
router.post("/changeAdminPassword", authenticate, Password.changeAdminPassword);

// -------------------------------------STUDENT-------------------------------------------------------

//LOGIN STUDENT
router.post(
    "/loginStudent",
    [
        check("studentId").not().isEmpty().withMessage("Enter ID to login"),
        check("password")
            .not()
            .isEmpty()
            .withMessage("Enter password to login."),
    ],
    validate,
    Auth.loginStudent
);

// FORGET PASSWORD
router.post(
    "/forget",
    [check("email").isEmail().withMessage("Enter a valid email address")],
    validate,
    Password.forget
);

router.post("/resetRequest", Password.resetRequest);

router.post(
    "/resetPassword/:userId",
    [
        check("password")
            .not()
            .isEmpty()
            .withMessage("Please enter password")
            .isLength({min: 8})
            .withMessage("Password should be at least  8 symbols"),
        check("confirmPassword", "Passwords do not match").custom(
            (value, {req}) => value === req.body.password
        ),
    ],
    validate,
    Password.resetPassword
);

// ------------------------------------------------TUTOR------------------------------------------------------------

//LOGIN TUTOR
router.post(
    "/loginTutor",
    [
        check("tutorId").not().isEmpty().withMessage("Enter ID to login"),
        check("password")
            .not()
            .isEmpty()
            .withMessage("Enter password to login."),
    ],
    validate,
    Auth.loginTutor
);

// FORGET PASSWORD
router.post(
    "/forget",
    [check("email").isEmail().withMessage("Enter a valid email address")],
    validate,
    Password.forget
);

router.post("/resetRequest", Password.resetRequest);

router.post(
    "/resetPassword/:userId",
    [
        check("password")
            .not()
            .isEmpty()
            .withMessage("Please enter password")
            .isLength({min: 8})
            .withMessage("Password should be at least  8 symbols"),
        check("confirmPassword", "Passwords do not match").custom(
            (value, {req}) => value === req.body.password
        ),
    ],
    validate,
    Password.resetPassword
);

module.exports = router;
