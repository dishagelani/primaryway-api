const Resource = require("../models/resource");
const fs = require("fs");

exports.addResource = async (req, res) => {
    try {
        let image = undefined;
        if (req.file) {
            image =
                process.env.TYPE === "DEVELOPMENT"
                    ? `http://localhost:3000/resources/` +
                      req.file.filename.replace(/\s/g, "")
                    : `${process.env.PRODUCTION_URL}/resources/` +
                      req.file.filename.replace(/\s/g, "");
        }
        const newResource = await new Resource({...req.body, image}).save();
        if (newResource)
            res.status(200).json({message: "Resource added successfully !"});
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Something went wrong !"});
    }
};

exports.editResource = async (req, res) => {
    try {
        const {_id} = req.params;

        const editResource = await Resource.findOne({_id});
        let image = editResource.image;

        if (req.file) {
            image =
                process.env.TYPE === "DEVELOPMENT"
                    ? `http://localhost:3000/resources/` +
                      req.file.filename.replace(/\s/g, "")
                    : `${process.env.PRODUCTION_URL}/resources/` +
                      req.file.filename.replace(/\s/g, "");
        }
        const update = await Resource.findOneAndUpdate(
            {_id},
            {...req.body, image},
            {new: true}
        );

        if (update) {
            if (editResource.image && req.file) {
                fs.unlinkSync(
                    `src/public/resources/${editResource.image
                        .split("/")
                        .pop()}`
                );
            }

            res.status(200).json({message: "Updated Resource !"});
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message: "Something went wrong !"});
    }
};

exports.deleteResource = async (req, res) => {
    try {
        const {_id} = req.params;
        const deleteResource = await Resource.findOneAndDelete({_id});
        if (deleteResource) {
            if (deleteResource.image) {
                fs.unlinkSync(
                    `src/public/resources/${deleteResource.image
                        .split("/")
                        .pop()}`
                );
            }
            res.status(200).json({message: "Resource deleted successfully !"});
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message: "Something went wrong !"});
    }
};

exports.getResources = async (req, res) => {
    try {
        const resources = await Resource.find({}, {__v: 0, updatedAt: 0});
        res.status(200).json({resources});
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message: "Something went wrong !"});
    }
};
