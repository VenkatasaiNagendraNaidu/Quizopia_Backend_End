// routes/adminRoutes.js
const express = require('express');
const { getAllTeachers, getAllStudents,getPendingTeachers,getApprovedTeachers,getAdminNotices } = require('../controllers/adminController');
const { toggleNoticeVisibility,getTeacherNoticesForAdmin,deleteAdminNotice,createAdminNotice,AllAdminNotices, getActiveAdminNotices } = require('../controllers/adminController');

const router = express.Router();
router.post('/login', async (req, res) => {
    const { adminID, password } = req.body;
  
    const defaultAdmin = {
      id: '12345',
      password: '12345'
    };
  
    if (adminID === defaultAdmin.id && password === defaultAdmin.password) {
      return res.status(200).json({ message: 'Admin logged in successfully' });
    } else {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
  });

// POST: Create a new admin notice
router.post('/createAdminNotice', createAdminNotice);

// GET: Fetch active admin notices
router.get('/adminNotices', getActiveAdminNotices);
router.get('/allAdminNotices',AllAdminNotices);
router.delete('/deladminNotices/:id',deleteAdminNotice);
router.get('/teacherNotices', getTeacherNoticesForAdmin);
router.patch('/toggleVisibility/:id', toggleNoticeVisibility);

router.get('/teachers', getAllTeachers);
router.get('/students', getAllStudents);
router.get('/pending-teachers', getPendingTeachers);
router.get('/approved-teachers', getApprovedTeachers);
router.get('/notices',getAdminNotices);
module.exports = router;
