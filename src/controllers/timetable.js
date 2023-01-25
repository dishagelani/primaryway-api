const Class = require("../models/class");
const moment = require("moment");

exports.getTimetable = async (req, res) => {
    try {
        let array = [];

        const classs = await Class.find({});

        for (let cls of classs) {
            for (let s of cls.classSchedule) {
                array.push({
                    _id: cls._id,
                    name: cls.className,
                    date: s.date,
                    starttime: s.time[0],
                    endtime: s.time[1],
                });
            }
            for (let q of cls.quizSchedule) {
                array.push({
                    _id: cls._id,
                    name: q.name,
                    date: q.date,
                    starttime: q.time[0],
                    endtime: q.time[1],
                });
            }
        }

        res.json({
            length: array.length,
            array: array,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "something went wrong"});
    }
};
