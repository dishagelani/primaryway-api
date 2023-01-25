const express = require("express");
const Quiz = require("../controllers/quiz");
const router = express.Router();

// GET Quizes
router.get("/getQuizes", Quiz.getQuizes);
router.get("/getQuizById/:_id", Quiz.getQuizById);

// ADD Quiz
router.post("/addQuiz", Quiz.addQuiz);

//EDIT Quiz
router.post("/editQuiz/:classId/:quizId", Quiz.editQuiz);

//DELETE Quiz
router.delete("/deleteQuiz/:classId/:quizId", Quiz.deleteQuiz);

module.exports = router;
