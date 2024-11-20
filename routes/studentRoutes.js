const express = require('express');
const { getStudentQuizzes,scoreCards,submitQuiz,getQuizById,getQuizzesForStudents ,signupStudent,studentLogin,getNotices, getScorecard } = require('../controllers/studentController');
const router = express.Router();

router.post('/signup', signupStudent);
router.post('/login', studentLogin);
router.get('/notices',  getNotices);
router.get('/student-quizzes',getQuizzesForStudents );
router.get('/scorecard',  getScorecard);
router.get('/quiz/:quizID',getQuizById);
router.post('/save-quiz-result', submitQuiz);
router.get('/scorecards/:studentId',scoreCards);
router.get('/getStudentQuizes',getStudentQuizzes)

module.exports = router;
