const Book = require("../models/book");
const fs = require("fs"); 
const {getPublicImageURLFromFirebase, deleteImageFromFirebase} = require("../utils/index")

exports.addBook = async (req, res) => {
    try {
        let image = undefined;
        if (req.file) {
            const file = req.file;
            image = await  getPublicImageURLFromFirebase(file)
        }
        const newBook = await new Book({...req.body, image}).save();
        if (newBook)
            res.status(200).json({message: "Book added successfully !"});
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Something went wrong !"});
    }
};

exports.editBook = async (req, res) => {
    try {
        const {_id} = req.params;

        const editBook = await Book.findOne({_id});
        let image = editBook.image;

        if (req.file) {
            const file = req.file;
            image = await  getPublicImageURLFromFirebase(file)
        }
        const update = await Book.findOneAndUpdate(
            {_id},
            {...req.body, image},
            {new: true}
        );

        if (update) {
            if (editBook.image && req.file) {
                deleteImageFromFirebase(editBook.image.split("/").pop()).then(() => res.status(200).json({message: "Updated Book !"}))
            }
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message: "Something went wrong !"});
    }
};

exports.deleteBook = async (req, res) => {
    try {
        const {_id} = req.params;
        const deleteBook = await Book.findOneAndDelete({_id});
        if (deleteBook) {
            if (deleteBook.image) {
                if (deleteBook.image != "")
                    deleteImageFromFirebase(deleteBook.image.split("/").pop()).then(() => res.status(200).json({message: "Book deleted successfully !"}))

            }
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message: "Something went wrong !"});
    }
};

exports.getBooks = async (req, res) => {
    try {
        const books = await Book.find({}, {__v: 0, updatedAt: 0}).populate(
            "course",
            {name: 1}
        );
        res.status(200).json({books});
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message: "Something went wrong !"});
    }
};
