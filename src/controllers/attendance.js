const Student = require("../models/student");
const Class = require("../models/class");

exports.addAttendance = async (req, res) => {
    try {
        const {dateId, classId, studentId, value} = req.body;
        const classss = await Class.findOneAndUpdate(
            {
                _id: classId,
                "classSchedule._id": dateId,
            },
            {
                $push:
                    value == "Present"
                        ? {
                              "classSchedule.$.present": studentId,
                          }
                        : {"classSchedule.$.absent": studentId},
            }
        );
        const classssCleanUp = await Class.findOneAndUpdate(
            {
                _id: classId,
                "classSchedule._id": dateId,
            },
            {
                $pull:
                    value == "Present"
                        ? {
                              "classSchedule.$.absent": studentId,
                          }
                        : {"classSchedule.$.present": studentId},
            }
        );

        res.status(200).json({message: "Mofified attendence."});
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

exports.UIAddAttendance = async (req, res) => {
    try {
        const {dateId, classId, attendance} = req.body;
        let presentStudents = [];
        let absentStudents = [];

        for (let a of attendance) {
            if (a.value == true) presentStudents.push(a.studentId);
            else absentStudents.push(a.studentId);
        }
        const classss = await Class.findOneAndUpdate(
            {
                _id: classId,
                "classSchedule._id": dateId,
            },
            {
                $set: {
                    "classSchedule.$.present": presentStudents,
                    "classSchedule.$.absent": absentStudents,
                },
            }
        );

        res.status(200).json({message: "Mofified attendence.", classss});
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};
