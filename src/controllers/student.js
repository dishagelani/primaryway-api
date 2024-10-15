const Student = require("../models/student");
const Class = require("../models/class");
const crypto = require("crypto");
const fs = require("fs");
const moment = require("moment");
const today = moment.utc().startOf("day");
const {getPublicImageURLFromFirebase, deleteImageFromFirebase} = require("../utils/index")

const groupBy = (array, key) => {
    return array.reduce((result, currentValue) => {
        if (key == "date") {
            const date = JSON.stringify(currentValue.date)
                .split("T")[0]
                .replace('"', "");

            if (!result[date]) {
                result[date] = [];
            }
            result[date].push(currentValue);
        } else {
            (result[currentValue[key]] = result[currentValue[key]] || []).push(
                currentValue
            );
        }
        return result;
    }, {});
};

const convert = (obj) => {
    let all = [];

    Object.keys(obj).forEach(function (key) {
        all.push({
            date: moment.utc(key).format("DD MMM"),
            schedule: obj[key],
        });
    });

    return all.sort((a, b) => a.schedule[0].date - b.schedule[0].date);
};

exports.addStudent = async (req, res) => {
    //-----------------SEND ID TO STUDENT VIA EMAIL---------------------------

    try {
        let profilePicture = undefined;
        const existingEmail = await Student.findOne({email: req.body.email});

        if (existingEmail) {
            return res.status(400).json({
                message:
                    "The email address you have entered is already registered for another student !",
            });
        }

        if (req.file) {
            profilePicture = await  getPublicImageURLFromFirebase(req.file)
        }

        const studentId = crypto.randomBytes(4).toString("hex").toUpperCase();

        const student = await new Student({
            ...req.body,
            profilePicture,
            studentId,
        }).save();

        if (student) {
            // const subject = "Login credentials";
            // const username = user.username;
            // const to = user.email;
            // const from = process.env.ADMIN_EMAIL;
            // const html = `<p>Your account has been verified. You can log in using given ID and password.  </p><p><b>ID : </b> ${studentId}</p><p><b>Password : </b>${req.body.password}</p>`;

            // await sendMail({to, from, subject, username, html});

            return res.status(200).json({
                message: "Student added successfully !",
            });
        } else {
            return res.status(500).json({
                message: "Something went wrong",
            });
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};
exports.editStudent = async (req, res) => {
    try {
        const {email, _id} = req.body;
        

        if (email) {
            const existingEmail = await Student.findOne({
                email,
                _id: {$ne: _id},
            });

            if (existingEmail) {
                return res.status(400).json({
                    message:
                        "The email address you have entered is already registered for another student !",
                });
            }
        }

        const student = await Student.findOne({_id});

        Object.keys(req.body).forEach(function (key) {
            if (req.body[key]) student[key] = req.body[key];
        });

        if (req.file) {
            
            let profilePicture = await  getPublicImageURLFromFirebase(req.file)
            if (profilePicture) {
                await deleteImageFromFirebase(student.profilePicture.split("/").pop())
            }
            student.profilePicture = profilePicture;
        }

        await student
            .save()
            .then((updatedStudent) =>
                res
                    .status(200)
                    .json({message: "Updated student successfully !"})
            )
            .catch((e) => {
                console.log(e);
                res.status(500).json({message: "Something went wrong"});
            });
    } catch (error) {
        console.log("error", error);
        res.status(500).json({message: error.message});
    }
};
exports.deleteStudent = async (req, res) => {
    try {
        const {_id} = req.params;

        const deleteUser = await Student.findOneAndDelete({_id});

        if (deleteUser) {
            if (deleteUser.profilePicture) {
                if (deleteUser.profilePicture != "")
                    await deleteImageFromFirebase(deleteUser.profilePicture.split("/").pop())

            }
            Class.updateMany(
                {},
                {$pull: {students: _id}},
                {
                    new: true,
                }
            ).then((result) => {
                res.status(200).json({
                    message: "Deleted student successfully !",
                });
            });
        } else {
            res.status(500).json({message: "Something went wrong !"});
        }
    } catch (error) {
        console.log("error", error);
        res.status(500).json({message: error.message});
    }
};

exports.getStudents = async (req, res) => {
    try {
        await Student.find({}, {__v: 0, createdAt: 0, updatedAt: 0})
            .then((students) =>
                res.status(200).json({
                    "Total Students ": students.length,
                    students,
                })
            )
            .catch((e) => res.status(500).json({error: e}));
    } catch (e) {
        res.status(500).json({error: e});
    }
};

exports.getStudentById = async (req, res) => {
    try {
        const {_id} = req.params;
        const student = await Student.findOne({_id}, {__v: 0, loginToken: 0});
        res.status(200).json({student});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};

exports.getTodaysSchedule = async (req, res) => {
    try {
        const student = req.user;

        Class.find(
            {
                students: student._id.toString(),
            },
            {__v: 0, createdAt: 0, updatedAt: 0}
        )
            .then((classss) => {
                let todaysClass = [];

                for (let classs of classes) {
                    for (let cls of classs.classSchedule) {
                        if (
                            cls.date >= today.toDate() &&
                            cls.date <= moment.utc(today).endOf("day").toDate()
                        ) {
                            todaysClass.push({
                                type: "lesson",
                                classId: classs._id,
                                name: classs.className,
                                time: "12:00 - 1:00",
                                date: cls.date,
                                _id: cls._id,
                            });
                        }
                    }
                    for (let qzz of classs.quizSchedule) {
                        if (
                            qzz.date >= today.toDate() &&
                            qzz.date <= moment.utc(today).endOf("day").toDate()
                        ) {
                            todaysClass.push({
                                type: "quiz",
                                classId: classs._id,
                                name: qzz.name,
                                time: "1:00 - 2:00",
                                date: qzz.date,
                                _id: qzz._id,
                            });
                        }
                    }
                }

                const schedule = convert(groupBy(todaysClass, "date"));

                res.status(200).json({
                    schedule,
                });
            })
            .catch((e) => res.status(500).json({error: e.message}));
    } catch (e) {
        res.status(500).json({error: e});
    }
};
exports.getClasses = async (req, res) => {
    try {
        const student = req.user;

        Class.find(
            {
                students: student._id.toString(),
            },
            {__v: 0, createdAt: 0, updatedAt: 0}
        )
            .populate("tutor students", {
                name: 1,
                surname: 1,
                profilePicture: 1,
            })
            .then((cls) => {
                let classes = [];

                for (let classs of cls) {
                    classes.push({
                        _id: classs._id,
                        class: classs.className,
                        tutor: classs.tutor,
                        hours: "25 hours",
                        grade: "A+",
                    });
                }

                res.status(200).json({
                    classes,
                });
            })
            .catch((e) => res.status(500).json({error: e.message}));
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};
exports.getClassById = async (req, res) => {
    try {
        const {_id} = req.params;

        Class.findOne({
            _id,
        })
            .populate("tutor", {
                name: 1,
                surname: 1,
                profilePicture: 1,
            })
            .then((classs) => {
                let timetable = [];

                for (let cls of classs.classSchedule) {
                    if (cls.date) {
                        timetable.push({
                            _id: cls._id,
                            date: cls.date,
                            name: classs.className,
                            time: "12.30 - 1.30",
                        });
                    }
                }
                for (let qzz of classs.quizSchedule) {
                    if (qzz.date) {
                        timetable.push({
                            _id: qzz._id,
                            date: qzz.date,
                            name: qzz.name,
                            time: "2.30 - 3.30",
                        });
                    }
                }

                const classDetails = {
                    _id: classs._id,
                    className: classs.className,
                    avgMark: "A+",
                    lessons: classs.classSchedule.length,
                    hours: 25,
                    tutor: classs.tutor,
                    description:
                        "lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum",
                    timetable: convert(groupBy(timetable, "date")),
                };

                res.status(200).json({
                    classDetails,
                });
            })
            .catch((e) => res.status(500).json({error: e.message}));
    } catch (e) {
        res.status(500).json({error: e});
    }
};

exports.getScheduleOfMonth = async (req, res) => {
    try {
        const student = req.user;

        Class.find(
            {
                students: student._id.toString(),
            },
            {__v: 0, createdAt: 0, updatedAt: 0}
        )
            .then((classes) => {
                let todaysClass = [];

                for (let classs of classes) {
                    for (let cls of classs.classSchedule) {
                        if (
                            cls.date >= today.toDate() &&
                            cls.date <=
                                moment.utc(today).endOf("month").toDate()
                        ) {
                            todaysClass.push({
                                type: "lesson",
                                classId: classs._id,
                                name: classs.className,
                                time: "12:00 - 1:00",
                                date: cls.date,
                                _id: cls._id,
                            });
                        }
                    }
                    for (let qzz of classs.quizSchedule) {
                        if (
                            qzz.date >= today.toDate() &&
                            qzz.date <=
                                moment.utc(today).endOf("month").toDate()
                        ) {
                            todaysClass.push({
                                type: "quiz",
                                classId: classs._id,
                                name: qzz.name,
                                time: "1:00 - 2:00",
                                date: qzz.date,
                                _id: qzz._id,
                            });
                        }
                    }
                }

                const individual = groupBy(todaysClass, "type");

                res.status(200).json({
                    all: convert(groupBy(todaysClass, "date")),
                    lesson: convert(
                        groupBy(
                            individual.lesson ? individual.lesson : [],
                            "date"
                        )
                    ),
                    quiz: convert(
                        groupBy(individual.quiz ? individual.quiz : [], "date")
                    ),
                });
            })
            .catch((e) => res.status(500).json({error: e.message}));
    } catch (e) {
        res.status(500).json({error: e});
    }
};

exports.getLesson = async (req, res) => {
    try {
        const {_id, dateId} = req.params;
        let lesson = {};
        Class.findOne(
            {
                _id,
                "classSchedule._id": dateId,
            },
            {"classSchedule.$": 1, tutor: 1, className: 1}
        )
            .populate("tutor", {
                name: 1,
                surname: 1,
                profilePicture: 1,
            })
            .then((classs) => {
                if (classs) {
                    lesson = {
                        _id: classs?._id,
                        tutor: classs?.tutor,
                        date: moment
                            .utc(classs?.classSchedule[0].date)
                            .format("DD MMM"),
                        grade: "A+",
                        class: classs?.className,
                        time: "12:00 - 1.00",
                        description:
                            "Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum ",
                    };
                }
                res.status(200).json({
                    lesson,
                });
            })
            .catch((e) => res.status(500).json({error: e.message}));
    } catch (e) {
        res.status(500).json({error: e});
    }
};

exports.UIHomeAPI = async (req, res) => {
    try {
        const student = req.user;
        let quizzes = [];
        let classes = [];

        const classss = await Class.find(
            {
                students: student._id.toString(),
            },
            {__v: 0, createdAt: 0, updatedAt: 0}
        );

        if (classss.length) {
            for (let classs of classss) {
                for (let cls of classs.classSchedule) {
                    if (
                        cls.date >= today.toDate() &&
                        cls.date <= moment.utc(today).endOf("month").toDate()
                    ) {
                        classes.push({
                            classId: classs._id,
                            dateId: cls._id,
                            date: cls.date,
                            name: classs.className,
                            startTime: cls.time[0],
                            endTime: cls.time[1],
                            completed: cls.completed,
                        });
                    }
                }
                for (let qzz of classs.quizSchedule) {
                    if (
                        qzz.date >= today.toDate() &&
                        qzz.date <= moment.utc(today).endOf("month").toDate()
                    ) {
                        quizzes.push({
                            classId: classs._id,
                            dateId: qzz._id,
                            date: qzz.date,
                            name: qzz.className,
                            startTime: qzz.time[0],
                            endTime: qzz.time[1],
                            completed: qzz.completed,
                        });
                    }
                }
            }
        }

        res.json({
            classes: convert(groupBy(classes, "date")),
            quizzes: convert(groupBy(quizzes, "date")),
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({error: e.message});
    }
};
