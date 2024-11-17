const express = require('express');
const { signupStudent,studentLogin,getNotices, getTeacherQuizzes, getUpcomingQuizzes, getOngoingQuizzes, getPastQuizzes, getScorecard } = require('../controllers/studentController');
const router = express.Router();

router.post('/signup', signupStudent);
router.post('/login', studentLogin);
router.get('/notices',  getNotices);
router.get('/quizzes/teacher',  getTeacherQuizzes);
router.get('/quizzes/upcoming',  getUpcomingQuizzes);
router.get('/quizzes/ongoing',  getOngoingQuizzes);
router.get('/quizzes/past',  getPastQuizzes);
router.get('/scorecard',  getScorecard);

module.exports = router;
