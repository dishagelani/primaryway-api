const Course = require("../models/course");
const Class = require("../models/class");

exports.addClass = async (req, res) => {
    try {
        const {_id, className, tutor} = req.body;

        const newClass = await new Class({
            className,
            tutor,
            courseId: _id,
        }).save();
        if (!newClass) {
            return res.status(500).json({message: "Something went wrong !"});
        }

        Course.findOneAndUpdate(
            {_id},
            {$push: {classes: newClass._id.toString()}},
            {new: true}
        ).then(() =>
            res.status(200).json({message: "New class added ! ", newClass})
        );
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "something went wrong !"});
    }
};

exports.editClass = async (req, res) => {
    try {
        const {_id} = req.params;

        const editclass = await Class.findOne({_id});
        Object.keys(req.body).forEach(function (key) {
            if (req.body[key]) editclass[key] = req.body[key];
        });

        await editclass.save();

        res.status(200).json({message: "class edited ! "});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "something went wrong !"});
    }
};

exports.getClassById = async (req, res) => {
    try {
        const _id = req.params._id;

        const classs = await Class.findOne(
            {_id},
            {createdAt: 0, __v: 0, updatedAt: 0}
        ).populate("tutor students", {
            profilePicture: 1,
            name: 1,
            surname: 1,
        });

        const classDetails = {
            _id: classs._id,
            courseId: classs.courseId,
            className: classs.className,
            tutor: classs.tutor,
            students: classs.students,
            classSchedule: classs.classSchedule.sort(),
        };

        res.status(200).json({classDetails});
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Something went wrong ! "});
    }
};

exports.deleteClass = async (req, res) => {
    try {
        const {_id, classId} = req.params;

        const deleteClass = await Class.findOneAndRemove({_id: classId});

        if (!deleteClass)
            return res.status(500).json({message: "Something went wrong !"});

        Course.findOneAndUpdate(
            {_id},
            {$pull: {classes: classId}},
            {
                new: true,
            }
        ).then((result) => {
            res.status(200).json({message: "Deleted class successfully !"});
        });
    } catch (error) {
        console.log("error", error);
        res.status(500).json({message: error.message});
    }
};

exports.addDateToClass = async (req, res) => {
    try {
        const {classDate, classTime, _id} = req.body;
        console.log(req.body);

        const newDate = await Class.findOneAndUpdate(
            {_id},
            {
                $push: {
                    classSchedule: {
                        date: classDate,
                        time: classTime,
                    },
                },
            },

            {
                new: true,
            }
        );

        if (!newDate) {
            return res.status(500).json({message: "Something went wrong !"});
        }

        res.status(200).json({message: "New date added to course ! ", newDate});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "something went wrong !"});
    }
};

exports.editDateInClass = async (req, res) => {
    try {
        const {classDate, classTime, dateId, _id} = req.body;

        console.log(classDate);

        const editDate = await Class.findOneAndUpdate(
            {_id},
            {
                $set: {
                    "classSchedule.$[j].date": classDate,
                    "classSchedule.$[j].time": classTime,
                },
            },

            {
                arrayFilters: [
                    {
                        "j._id": dateId,
                    },
                ],
                new: true,
            }
        );

        if (!editDate) {
            return res.status(500).json({message: "Something went wrong !"});
        }

        res.status(200).json({
            message: "Date Edited added to course ! ",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "something went wrong !"});
    }
};

exports.deleteDateFromClass = async (req, res) => {
    try {
        const {_id, dateId} = req.params;

        const newDate = await Class.findOneAndUpdate(
            {_id},
            {$pull: {classSchedule: {_id: dateId}}},
            {
                new: true,
            }
        );

        if (!newDate) {
            return res.status(500).json({message: "Something went wrong !"});
        }

        res.status(200).json({message: "Date deleted ! ", newDate});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "something went wrong !"});
    }
};

exports.addStudentToClass = async (req, res) => {
    try {
        const {_id, studentId} = req.body;

        const newStudent = await Class.findOneAndUpdate(
            {_id},
            {$push: {students: studentId}},
            {
                new: true,
            }
        );

        if (!newStudent) {
            return res.status(500).json({message: "Something went wrong !"});
        }

        res.status(200).json({
            message: "New student added to course ! ",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "something went wrong !"});
    }
};

exports.deleteStudentFromClass = async (req, res) => {
    try {
        const {_id, studentId} = req.params;

        const deletedStudent = await Class.findOneAndUpdate(
            {_id},
            {$pull: {students: studentId}},
            {
                new: true,
            }
        );

        if (!deletedStudent) {
            return res.status(500).json({message: "Something went wrong !"});
        }

        res.status(200).json({message: "Student deleted ! ", deletedStudent});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "something went wrong !"});
    }
};
