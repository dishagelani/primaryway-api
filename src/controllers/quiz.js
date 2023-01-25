const Class = require("../models/class");

exports.addQuiz = async (req, res) => {
    try {
        console.log(req.body);
        const {date, time, classId, courseId, name} = req.body;

        const newQuiz = await Class.findOneAndUpdate(
            {_id: classId, courseId},
            {
                $push: {
                    quizSchedule: {
                        date,
                        time,
                        name,
                    },
                },
            },

            {
                new: true,
            }
        );
        if (newQuiz)
            res.status(200).json({message: "Quiz added successfully !"});
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message: "Something went wrong !"});
    }
};

exports.editQuiz = async (req, res) => {
    try {
        const {classId, quizId} = req.params;
        const {name, date, time} = req.body;

        console.log(req.body);
        const editQuiz = await Class.findOneAndUpdate(
            {_id: classId},
            {
                $set: {
                    "quizSchedule.$[j].date": date,
                    "quizSchedule.$[j].time": time,
                    "quizSchedule.$[j].name": name,
                },
            },

            {
                arrayFilters: [
                    {
                        "j._id": quizId,
                    },
                ],
                new: true,
            }
        );
        if (editQuiz) res.status(200).json({message: "Updated Quiz details !"});
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message: "Something went wrong !"});
    }
};

exports.deleteQuiz = async (req, res) => {
    try {
        console.log(req.body);
        const {classId, quizId} = req.params;
        const deleteQuiz = await Class.findOneAndUpdate(
            {_id: classId},
            {
                $pull: {
                    quizSchedule: {
                        _id: quizId,
                    },
                },
            },

            {
                new: true,
            }
        );

        if (deleteQuiz)
            res.status(200).json({message: "Quiz deleted successfully !"});
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message: "Something went wrong !"});
    }
};

exports.getQuizes = async (req, res) => {
    try {
        let array = [];
        const quizes = await Class.find(
            {},
            {__v: 0, createdAt: 0, updatedAt: 0}
        ).populate("courseId", {name: 1});

        if (quizes) {
            for (let quiz of quizes) {
                if (quiz.quizSchedule.length) {
                    for (let q of quiz.quizSchedule) {
                        array.push({
                            quiz: q,
                            course: quiz.courseId,
                            className: quiz.className,
                            _id: quiz._id,
                        });
                    }
                }
            }
        }

        res.status(200).json({
            quizes: array.sort((a, b) => a.quiz.date - b.quiz.date),
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message: "Something went wrong !"});
    }
};

exports.getQuizById = async (req, res) => {
    try {
        const {_id} = req.params;
        const quiz = await Quiz.findOne(
            {_id},
            {__v: 0, createdAt: 0, updatedAt: 0}
        );
        res.status(200).json({quiz});
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message: "Something went wrong !"});
    }
};
