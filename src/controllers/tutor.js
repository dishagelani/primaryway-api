const Tutor = require("../models/tutor");
const crypto = require("crypto");
const fs = require("fs");
const Class = require("../models/class");
const moment = require("moment");
const today = moment.utc().startOf("day");

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
            schedule: obj[key].sort(function (a, b) {
                return moment.utc(a.startTime) - moment.utc(b.startTime) === 0
                    ? moment.utc(a.endTime) - moment.utc(b.endTime)
                    : moment.utc(a.startTime) - moment.utc(b.startTime);
            }),
        });
    });

    return all.sort((a, b) => a.schedule[0].date - b.schedule[0].date);
};

exports.addTutor = async (req, res) => {
    //-----------------------------------TODO : SEND ID TO Tutor VIA EMAIL---------------------------------------//

    try {
        let profilePicture = undefined;

        const existingEmail = await Tutor.findOne({email: req.body.email});

        if (existingEmail) {
            return res.status(400).json({
                message:
                    "The email address you have entered is already registered for another Tutor !",
            });
        }
        const existingPhone = await Tutor.findOne({
            phoneNumber: req.body.phoneNumber,
        });

        if (existingPhone) {
            return res.status(400).json({
                message:
                    "The phone number you have entered is already registered for another Tutor !",
            });
        }

        if (req.file) {
            profilePicture =
                process.env.TYPE === "DEVELOPMENT"
                    ? `http://localhost:3000/tutor_profile_pictures/` +
                      req.file.filename.replace(/\s/g, "")
                    : `${process.env.PRODUCTION_URL}/tutor_profile_pictures/` +
                      req.file.filename.replace(/\s/g, "");
        }

        const tutorId = crypto.randomBytes(4).toString("hex").toUpperCase();

        const tutor = await new Tutor({
            ...req.body,
            profilePicture,
            tutorId,
        }).save();

        if (tutor) {
            // const subject = "Login credentials";
            // const username = user.username;
            // const to = user.email;
            // const from = process.env.ADMIN_EMAIL;
            // const html = `<p>Your account has been verified. You can log in using given ID and password.  </p><p><b>ID : </b> ${TutorId}</p><p><b>Password : </b>${req.body.password}</p>`;

            // await sendMail({to, from, subject, username, html});

            return res.status(200).json({
                message: "Tutor added successfully !",
            });
        } else {
            return res.status(500).json({
                message: "Something went wrong",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
};

exports.editTutor = async (req, res) => {
    try {
        const {email, _id, phoneNumber} = req.body;

        if (email) {
            const existingEmail = await Tutor.findOne({
                email,
                _id: {$ne: _id},
            });

            if (existingEmail) {
                return res.status(400).json({
                    message:
                        "The email address you have entered is already registered for another Tutor !",
                });
            }
        }
        if (phoneNumber) {
            const existingPhone = await Tutor.findOne({
                phoneNumber,
                _id: {$ne: _id},
            });

            if (existingPhone) {
                return res.status(400).json({
                    message:
                        "The email address you have entered is already registered for another Tutor !",
                });
            }
        }

        const tutor = await Tutor.findOne({_id});
        const profilePicture = tutor.profilePicture;

        Object.keys(req.body).forEach(function (key) {
            if (req.body[key]) tutor[key] = req.body[key];
        });

        if (req.file) {
            tutor.profilePicture =
                process.env.TYPE === "DEVELOPMENT"
                    ? `http://localhost:3000/tutor_profile_pictures/` +
                      req.file.filename.replace(/\s/g, "")
                    : `${process.env.PRODUCTION_URL}/tutor_profile_pictures/` +
                      req.file.filename.replace(/\s/g, "");
        }

        await tutor
            .save()
            .then((updatedTutor) => {
                if (req.file && profilePicture) {
                    fs.unlinkSync(
                        `src/public/tutor_profile_pictures/${profilePicture
                            .split("/")
                            .pop()}`
                    );
                }
                res.status(200).json({
                    message: "Updated tutor details successfully !",
                    updatedTutor,
                });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({message: "Something went wrong !"});
            });
    } catch (error) {
        console.log("error", error);
        res.status(500).json({message: error.message});
    }
};

exports.setupTutorProfile = async (req, res) => {
    try {
        const {firstName, lastName, degree, gender} = req.body;
        const userId = req.user._id;

        const user = await Tutor.findOne({_id: userId});

        if (!user) {
            return res.status(401).json({message: "Unauthorized access !!"});
        }

        if (req.file) {
            if (user.profilePicture)
                fs.unlinkSync(
                    `src/public/tutor_profile_pictures/${user.profilePicture
                        .split("/")
                        .pop()}`
                );
            profilePicture =
                process.env.TYPE === "DEVELOPMENT"
                    ? `http://localhost:3000/tutor_profile_pictures/` +
                      req.file.filename.replace(/\s/g, "")
                    : `${process.env.PRODUCTION_URL}/tutor_profile_pictures/` +
                      req.file.filename.replace(/\s/g, "");

            user.profilePicture = profilePicture;
        }

        user.name = firstName;
        user.surname = lastName;
        user.gender = gender;
        user.degree = degree;

        await user.save();

        if (user) {
            return res.status(200).json({
                message: "User profile created successfully",
                user: user,
            });
        } else {
            return res.status(500).json({
                message: "Something went wrong",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
};

exports.deleteTutor = async (req, res) => {
    try {
        const {_id} = req.params;

        const deleteUser = await Tutor.findOneAndDelete({_id});

        if (deleteUser) {
            if (deleteUser.profilePicture) {
                if (deleteUser.profilePicture != "")
                    fs.unlinkSync(
                        `src/public/tutor_profile_pictures/${deleteUser.profilePicture
                            .split("/")
                            .pop()}`
                    );
            }
            Class.updateMany({tutor: _id}, {tutor: undefined}).then(() =>
                res.status(200).json({message: "Deleted tutor successfully !"})
            );
        } else {
            res.status(500).json({message: "Something went wrong !"});
        }
    } catch (error) {
        console.log("error", error);
        res.status(500).json({message: error.message});
    }
};

exports.getTutorById = async (req, res) => {
    try {
        const {_id} = req.params;
        const tutor = await Tutor.findOne({_id}, {__v: 0, loginToken: 0});
        res.status(200).json({tutor});
    } catch (e) {
        console.log(e);
        res.status(500).json({message: e.message});
    }
};

exports.getTutorDetails = async (req, res) => {
    try {
        const _id = req.user._id;

        const tutor = await Tutor.findOne({_id}, {__v: 0, loginToken: 0});
        res.status(200).json({tutor});
    } catch (e) {
        console.log(e);
        res.status(500).json({message: e.message});
    }
};

exports.getTutors = async (req, res) => {
    try {
        Tutor.find({}, {__v: 0, createdAt: 0, updatedAt: 0})
            .then((tutors) =>
                res.status(200).json({
                    "Total registered tutors ": tutors.length,
                    tutors,
                })
            )
            .catch((e) => res.status(500).json({error: e.message}));
    } catch (e) {
        console.log(e);
        res.status(500).json({error: e.message});
    }
};

exports.getTodaysSchedule = async (req, res) => {
    try {
        const tutor = req.user;

        Class.find(
            {
                tutor: tutor._id.toString(),
            },
            {__v: 0, createdAt: 0, updatedAt: 0}
        )
            .then((classes) => {
                let todaysClass = [];

                for (let classs of classes) {
                    for (let cls of classs.classSchedule) {
                        if (
                            cls.date >= today.toDate() &&
                            cls.date <= moment.utc(today).endOf("day").toDate()
                        ) {
                            todaysClass.push({
                                classId: classs._id,
                                name: classs.className,
                                time: "12:00 - 1:00",
                                date: cls.date,
                                group: "Group A",
                                _id: cls._id,
                            });
                        }
                    }
                }

                const schedule = convert(groupBy(todaysClass, "date"));

                res.status(200).json({
                    schedule,
                });
            })
            .catch((e) => {
                console.log(e);
                res.status(500).json({error: e.message});
            });
    } catch (e) {
        console.log(e);
        res.status(500).json({error: e.message});
    }
};

exports.getClasses = async (req, res) => {
    try {
        const tutor = req.user;

        Class.find(
            {
                tutor: tutor._id.toString(),
            },
            {__v: 0, createdAt: 0, updatedAt: 0}
        )
            .then((classess) => {
                let classes = [];

                for (let classs of classess) {
                    classes.push({
                        _id: classs._id,
                        class: classs.className,
                        students: classs.students?.length,
                        group: "Group A",
                    });
                }

                res.status(200).json({
                    classes,
                });
            })
            .catch((e) => res.status(500).json({error: e.message}));
    } catch (e) {
        console.log(e);
        res.status(500).json({error: e.message});
    }
};

exports.getClassById = async (req, res) => {
    try {
        const {_id} = req.params;

        Class.findOne({
            _id,
        })
            .populate("tutor students", {
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
                    group: "Group A",
                    tutor: classs.tutor,
                    students: classs.students,
                    timetable: convert(groupBy(timetable, "date")),
                };

                res.status(200).json({
                    classDetails,
                });
            })
            .catch((e) => res.status(500).json({error: e.message}));
    } catch (e) {
        console.log(e);
        res.status(500).json({error: e.message});
    }
};

exports.getScheduleOfMonth = async (req, res) => {
    try {
        const tutor = req.user;

        Class.find(
            {
                tutor: tutor._id.toString(),
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
                                group: "Group A",
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
                                group: "Group A",
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
        console.log(e);
        res.status(500).json({error: e.message});
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
                        _id: classs._id,
                        tutor: classs.tutor,
                        date: moment
                            .utc(classs.classSchedule[0].date)
                            .format("DD MMM"),
                        group: "Group A",
                        class: classs.className,
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
        console.log(e);
        res.status(500).json({error: e.message});
    }
};

exports.UIHomeApi = async (req, res) => {
    try {
        const tutor = req.user;
        let list = [];
        let timetable = [];

        const classes = await Class.find(
            {
                tutor: tutor._id.toString(),
            },
            {__v: 0, createdAt: 0, updatedAt: 0}
        ).populate("courseId");

        if (classes.length) {
            for (let classs of classes) {
                if (!list.find((l) => l._id == classs.courseId._id))
                    list.push({
                        _id: classs.courseId._id,
                        image: classs.courseId.coursePicture,
                        year: 2,
                        courseName: classs.courseId.name,
                        weeks: classs.courseId.weeks,
                    });

                for (let cls of classs.classSchedule) {
                    if (
                        cls.date >= today.toDate() &&
                        cls.date <= moment.utc(today).endOf("month").toDate()
                    ) {
                        timetable.push({
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
            }
        }

        res.json({timetable: convert(groupBy(timetable, "date")), list});
    } catch (e) {
        console.log(e);
        res.status(500).json({error: e.message});
    }
};

exports.UIClassAPI = async (req, res) => {
    try {
        const {_id, dateId} = req.params;
        let lesson = {};
        let students = [];

        const classs = await Class.findOne(
            {
                _id,
                "classSchedule._id": dateId,
            },
            {"classSchedule.$": 1, className: 1, courseId: 1, students: 1}
        ).populate("courseId students", {
            name: 1,
            surname: 1,
            profilePicture: 1,
            description: 1,
        });

        if (classs) {
            for (let s of classs.students) {
                if (classs.classSchedule[0].present.includes(s._id)) {
                    students.push({
                        _id: s._id,
                        profilePicture: s.profilePicture,
                        name: s.name,
                        surname: s.surname,
                        presence: true,
                    });
                } else {
                    students.push({
                        _id: s._id,
                        profilePicture: s.profilePicture,
                        name: s.name,
                        surname: s.surname,
                        presence: false,
                    });
                }
            }
            lesson = {
                _id: classs._id,
                course: classs.courseId.name,
                class: classs.className,
                date: moment.utc(classs.classSchedule[0].date).format("DD MMM"),
                time: `${moment
                    .utc(classs.classSchedule[0].time[0])
                    .format("hh:MM a")} - ${moment
                    .utc(classs.classSchedule[0].time[1])
                    .format("hh:MM a")}`,

                description: classs.courseId.description,
                students: students,
            };
        }
        res.status(200).json({
            lesson,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({error: e.message});
    }
};

exports.UICourseAPI = async (req, res) => {
    try {
        const tutor = req.user;

        const {_id} = req.params;

        let classes = [];
        let quizzes = [];
        let students = [];

        const course = await Class.find({
            courseId: _id,
            tutor: tutor._id.toString(),
        }).populate("courseId students", {
            name: 1,
            surname: 1,
            profilePicture: 1,
            coursePicture: 1,
            description: 1,
            weeks: 1,
        });

        for (let data of course) {
            for (let cls of data.classSchedule) {
                if (cls.date) {
                    classes.push({
                        classId: data._id,
                        dateId: cls._id,
                        date: cls.date,
                        name: data.className,
                        startTime: cls.time[0],
                        endTime: cls.time[1],
                        completed: cls.completed,
                    });
                }
            }
            for (let qzz of data.quizSchedule) {
                if (qzz.date) {
                    quizzes.push({
                        classId: data._id,
                        dateId: qzz._id,
                        date: qzz.date,
                        name: qzz.name,
                        startTime: qzz.time[0],
                        endTime: qzz.time[1],
                        completed: qzz.completed,
                    });
                }
            }

            for (let student of data.students) {
                if (!students.find((s) => s._id == student._id))
                    students.push(student);
            }
        }

        res.status(200).json({
            courseDetails: course[0].courseId,
            classes: convert(groupBy(classes, "date")),
            quizzes: convert(groupBy(quizzes, "date")),
            students: students,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({error: e.message});
    }
};
