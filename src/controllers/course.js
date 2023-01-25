const Course = require("../models/course");
const Class = require("../models/class");
const fs = require("fs");
const moment = require("moment");

exports.addCourse = async (req, res) => {
    try {
        console.log("req.body", req.body, "req.file", req.file);
        let coursePicture = undefined;
        if (req.file) {
            coursePicture =
                process.env.TYPE === "DEVELOPMENT"
                    ? `http://localhost:3000/course_pictures/` +
                      req.file.filename.replace(/\s/g, "")
                    : `${process.env.PRODUCTION_URL}/course_pictures/` +
                      req.file.filename.replace(/\s/g, "");
        }
        const newCourse = await new Course({
            ...req.body,
            coursePicture,
            weeks: Math.ceil(
                moment
                    .utc(req.body.endDate)
                    .diff(moment.utc(req.body.startDate), "hours")
            ),
        }).save();
        if (!newCourse) {
            return res.status(500).json({message: "Something went wrong !"});
        }

        res.status(200).json({message: "Course added successfully ! "});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message: "something went wrong !"});
    }
};
exports.editCourse = async (req, res) => {
    try {
        const {_id} = req.params;

        console.log(req.body);

        const course = await Course.findOne({_id});
        let coursePicture = course.coursePicture;

        if (req.file) {
            coursePicture =
                process.env.TYPE === "DEVELOPMENT"
                    ? `http://localhost:3000/course_pictures/` +
                      req.file.filename.replace(/\s/g, "")
                    : `${process.env.PRODUCTION_URL}/course_pictures/` +
                      req.file.filename.replace(/\s/g, "");
        }

        const savecourse = await Course.findOneAndUpdate(
            {_id},
            {...req.body, coursePicture}
        );
        if (savecourse) {
            if (req.file && course.coursePicture) {
                fs.unlinkSync(
                    `src/public/course_pictures/${course.coursePicture
                        .split("/")
                        .pop()}`
                );
            }
            res.status(200).json({message: "Course updated successfully! "});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "something went wrong !"});
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const {_id} = req.params;

        const deleteCourse = await Course.findOneAndDelete({_id});

        if (deleteCourse) {
            if (deleteCourse.coursePicture) {
                if (deleteCourse.coursePicture != "")
                    fs.unlinkSync(
                        `src/public/course_pictures/${deleteCourse.coursePicture
                            .split("/")
                            .pop()}`
                    );
            }

            Class.deleteMany({courseId: _id}).then(() =>
                res.status(200).json({message: "Deleted course successfully !"})
            );
        } else {
            res.status(500).json({message: "Something went wrong !"});
        }
    } catch (error) {
        console.log("error", error);
        res.status(500).json({message: error.message});
    }
};

exports.getCourseById = async (req, res) => {
    try {
        const _id = req.params._id;
        const course = await Course.findOne(
            {_id},
            {createdAt: 0, __V: 0, updatedAt: 0}
        ).populate({
            path: "classes",
            populate: [
                {
                    path: "tutor",
                    model: "Tutors",
                    select: "profilePicture name surname",
                },

                {
                    path: "students",
                    model: "Students",
                    select: "profilePicture name surname",
                },
            ],
        });

        res.status(200).json({course});
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Something went wrong ! "});
    }
};

exports.getCourses = async (req, res) => {
    try {
        let courses = [];
        let students = new Set();

        const courseArray = await Course.find(
            {},
            {createdAt: 0, __V: 0, updatedAt: 0}
        ).populate("classes");

        if (courseArray.length) {
            for (let course of courseArray) {
                const result = await Class.find({courseId: course._id});

                if (result) {
                    for (let j of result) {
                        for (let student of j.students) {
                            students.add(student);
                        }
                    }

                    courses.push({
                        _id: course._id,
                        name: course.name,
                        startDate: course.startDate,
                        endDate: course.endDate,
                        description: course.description,
                        color: course.color,
                        coursePicture: course.coursePicture,
                        classes: course.classes,
                        students: students.size,
                    });
                    students.clear();
                }
            }
        }

        res.status(200).json({courses});
    } catch (err) {
        console.log("err", err);
        res.status(500).json({message: "Something went wrong ! "});
    }
};
