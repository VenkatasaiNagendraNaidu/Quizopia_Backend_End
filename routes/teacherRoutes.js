const express = require('express');
const { deleteNotice,getNoticesByTeacher,deleteQuiz,removeStudentFromTeacher,getMyStudents,addStudentToTeacher,saveQuiz,postNotice,sendNotificationToStudents,signupTeacher, approveTeacher, declineTeacher,loginTeacher,getTeacherProfile,getTeacherQuizzes  } = require('../controllers/teacherController');

const router = express.Router();

router.post('/signup', signupTeacher);
router.put('/approve/:id', approveTeacher);
router.delete('/decline/:id', declineTeacher);
router.post('/login', loginTeacher);
router.get('/profile/:teacherID',getTeacherProfile);
router.get('/quizzes/:teacherID',getTeacherQuizzes);

router.post('/postNotice', postNotice);
router.post('/sendNotification', sendNotificationToStudents);
router.post('/saveQuiz', saveQuiz);
router.post('/addStudent', addStudentToTeacher);
router.get('/myStudents/:teacherID',getMyStudents)
router.post('/removeStudent',removeStudentFromTeacher )

router.delete('/delete-quiz/:quizID',deleteQuiz)


router.get('/:teacherID/notices', getNoticesByTeacher);

router.delete('/delete-notice/:noticeID', deleteNotice);

module.exports = router;