const nodemailer = require("nodemailer");

function sendMail(mailDetails) {
    let mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.ADMIN_EMAIL,
            pass: process.env.ADMIN_EMAIL_PASSWORD,
        },
    });

    return new Promise((resolve, reject) => {
        mailTransporter.sendMail(mailDetails, function (error, result) {
            if (error) {
                return reject(error);
            } else {
                return resolve(result);
            }
        });
    });
}

module.exports = {sendMail};
