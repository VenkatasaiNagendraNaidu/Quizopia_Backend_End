const express = require('express');
const { signupTeacher, approveTeacher, declineTeacher,loginTeacher  } = require('../controllers/teacherController');

const router = express.Router();

router.post('/signup', signupTeacher);
router.put('/approve/:id', approveTeacher);
router.delete('/decline/:id', declineTeacher);
router.post('/login', loginTeacher);

module.exports = router;