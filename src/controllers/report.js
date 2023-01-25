const Report = require("../models/report");

exports.addReport = async (req, res) => {
    try {
        console.log(req.body);

        const tutor = req.user;

        const newReport = await new Report({
            ...req.body,
            tutor: tutor._id.toString(),
        }).save();

        if (newReport)
            res.status(200).json({message: "Report added successfully !"});
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message: "Something went wrong !"});
    }
};

exports.editReport = async (req, res) => {
    try {
        const {_id} = req.params;

        const editReport = await Report.findOneAndUpdate(
            {_id},
            {...req.body},
            {new: true}
        );
        if (editReport)
            res.status(200).json({message: "Updated report details !"});
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message: "Something went wrong !"});
    }
};

exports.deleteReport = async (req, res) => {
    try {
        const {_id} = req.params;
        const deleteReport = await Report.findOneAndDelete({_id});
        if (deleteReport) {
            res.status(200).json({message: "Report deleted successfully !"});
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message: "Something went wrong !"});
    }
};

exports.getReports = async (req, res) => {
    try {
        const reports = await Report.find({}, {__v: 0, updatedAt: 0}).populate(
            "tutor student",
            {name: 1, surname: 1, profilePicture: 1}
        );
        res.status(200).json({reports});
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message: "Something went wrong !"});
    }
};

exports.getReportsForTutor = async (req, res) => {
    try {
        const _id = req.user._id.toString();

        const reports = await Report.find({tutor: _id}, {__v: 0}).populate(
            "tutor student",
            {name: 1, surname: 1, profilePicture: 1}
        );
        res.status(200).json({reports});
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message: "Something went wrong !"});
    }
};

exports.getStudentReport = async (req, res) => {
    try {
        const _id = req.user._id.toString();

        const reports = await Report.find({student: _id}, {__v: 0})
            .populate("tutor student", {
                name: 1,
                surname: 1,
                profilePicture: 1,
            })
            .sort({createdAt: -1});
        res.status(200).json({reports});
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message: "Something went wrong !"});
    }
};

exports.getReportById = async (req, res) => {
    try {
        const {_id} = req.params;
        const report = await Report.findOne(
            {_id},
            {__v: 0, createdAt: 0, updatedAt: 0}
        ).populate("tutor student", {name: 1, surname: 1, profilePicture: 1});
        res.status(200).json({report});
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message: "Something went wrong !"});
    }
};
