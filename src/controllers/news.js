const News = require("../models/news");
const fs = require("fs");
const {getPublicImageURLFromFirebase, deleteImageFromFirebase} = require("../utils/index")


exports.addNews = async (req, res) => {
    try {
        let image = undefined;
        if (req.file) {
            const file = req.file;
            image = await  getPublicImageURLFromFirebase(file)
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
            image = await  getPublicImageURLFromFirebase(file)
        }
        const update = await News.findOneAndUpdate(
            {_id},
            {...req.body, image},
            {new: true}
        );

        if (update) {
            if (editNews.image && req.file) {
                deleteImageFromFirebase(editNews.image.split("/").pop()).then(() => res.status(200).json({message: "Updated News !"}))

            }

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
                    deleteImageFromFirebase(deleteNews.image.split("/").pop()).then(() => res.status(200).json({message: "News deleted successfully !"}))

            }
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
