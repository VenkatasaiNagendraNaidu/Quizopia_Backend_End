const express = require('express');
const { submitQuiz,getQuizById,getQuizzesForStudents ,signupStudent,studentLogin,getNotices, getScorecard } = require('../controllers/studentController');
const router = express.Router();

router.post('/signup', signupStudent);
router.post('/login', studentLogin);
router.get('/notices',  getNotices);
router.get('/student-quizzes',getQuizzesForStudents );
router.get('/scorecard',  getScorecard);
router.get('/quiz/:quizID',getQuizById);
router.post('/submit-quiz/:quizID', submitQuiz);


module.exports = router;
