const nodemailer = require("nodemailer");
const { bucket } = require("../middlewares/firebase")

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

function getPublicImageURLFromFirebase(file) {
    return new Promise((resolve, reject) => {
        const fileName = Date.now() + "_" + file.originalname;
        const fileUpload = bucket.file(fileName);
        const stream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
        });


        stream.on("error", (err) => {
            console.error("File upload error:", err);
            reject("File upload error.");  // Reject the promise
        });

        stream.on("finish", async () => {

            try {
                await fileUpload.makePublic();
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
                resolve(publicUrl);  // Resolve the promise with the public URL
            } catch (error) {
                console.error("Error making file public:", error);
                reject("Error making file public.");  // Reject the promise
            }
        });

        // Ensure the stream ends properly
        stream.end(file.buffer);
    });
}

function deleteImageFromFirebase(fileName) {
    return new Promise((resolve, reject) => {
      const file = bucket.file(fileName);  // The fileName should be the path of the image in Firebase Storage
  
      file.delete()
        .then(() => {
          resolve(`File ${fileName} deleted successfully.`);
        })
        .catch((error) => {
          console.error("Error deleting file:", error);
          reject("Error deleting file: " + error.message);
        });
    });
  }
  


module.exports = { sendMail, getPublicImageURLFromFirebase, deleteImageFromFirebase };
