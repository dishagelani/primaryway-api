const News = require("../models/news");
const fs = require("fs");

exports.addNews = async (req, res) => {
    try {
        console.log(req.body);
        let image = undefined;
        if (req.file) {
            image =
                process.env.TYPE === "DEVELOPMENT"
                    ? `${process.env.LOCAL_URL}/news/` +
                      req.file.filename.replace(/\s/g, "")
                    : `${process.env.PRODUCTION_URL}/news/` +
                      req.file.filename.replace(/\s/g, "");
        }
        const newNews = await new News({...req.body, image}).save();
        if (newNews)
            res.status(200).json({message: "News added successfully !"});
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Something went wrong !"});
    }
};

exports.editNews = async (req, res) => {
    try {
        const {_id} = req.params;

        const editNews = await News.findOne({_id});
        let image = editNews.image;

        if (req.file) {
            image =
                process.env.TYPE === "DEVELOPMENT"
                    ? `${process.env.LOCAL_URL}/news/` +
                      req.file.filename.replace(/\s/g, "")
                    : `${process.env.PRODUCTION_URL}/news/` +
                      req.file.filename.replace(/\s/g, "");
        }
        const update = await News.findOneAndUpdate(
            {_id},
            {...req.body, image},
            {new: true}
        );

        if (update) {
            if (editNews.image && req.file) {
                fs.unlinkSync(
                    `src/public/news/${editNews.image.split("/").pop()}`
                );
            }

            res.status(200).json({message: "Updated News !"});
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message: "Something went wrong !"});
    }
};

exports.deleteNews = async (req, res) => {
    try {
        const {_id} = req.params;
        const deleteNews = await News.findOneAndDelete({_id});
        if (deleteNews) {
            if (deleteNews.image) {
                if (deleteNews.image != "")
                    fs.unlinkSync(
                        `src/public/news/${deleteNews.image.split("/").pop()}`
                    );
            }
            res.status(200).json({message: "News deleted successfully !"});
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message: "Something went wrong !"});
    }
};

exports.getNews = async (req, res) => {
    try {
        const news = await News.find({}, {__v: 0});
        res.status(200).json({news});
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message: "Something went wrong !"});
    }
};
exports.getNewsById = async (req, res) => {
    try {
        const {_id} = req.params;

        const news = await News.findOne({_id}, {__v: 0});
        res.status(200).json({news});
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message: "Something went wrong !"});
    }
};
