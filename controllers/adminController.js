const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Notice = require('../models/Notice');
const bcrypt = require('bcrypt');

// controllers/adminController.js
const AdminNotice = require('../models/AdminNotice');

// POST: Create a new admin notice
const createAdminNotice = async (req, res) => {
  const { text, adminId, postedAt, expireAt } = req.body;

  if (!text || !adminId || !postedAt || !expireAt) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newNotice = new AdminNotice({
      text,
      adminId,
      postedAt,
      expireAt,
    });

    await newNotice.save();
    res.status(201).json({ message: 'Admin notice created successfully' });
  } catch (error) {
    console.error('Error creating admin notice:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET: Fetch active admin notices
const getActiveAdminNotices = async (req, res) => {
  const currentDate = new Date();

  try {
    const activeNotices = await AdminNotice.find({
      postedAt: { $lte: currentDate },
      expireAt: { $gte: currentDate },
    });

    res.status(200).json(activeNotices);
  } catch (error) {
    console.error('Error fetching admin notices:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const AllAdminNotices = async(req,res)=>{
  try{
    const allNotices=await AdminNotice.find()
    res.status(200).json(allNotices)
  }
  catch(error){
    console.error('Error Fetchinf all Notices',error);
    res.status(500).json({message:'Server error'})
  }
};


const deleteAdminNotice = async (req, res) => {
  const { id } = req.params;

  try {
    const notice = await AdminNotice.findByIdAndDelete(id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    res.status(200).json({ message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notice', error });
  }
};


const getTeacherNoticesForAdmin = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0)); // Current date at midnight

    // Fetch all teacher notices
    const notices = await Notice.find();

    // Categorize notices
    const pastNotices = [];
    const presentNotices = [];
    const upcomingNotices = [];

    notices.forEach(notice => {
      const postedAt = new Date(notice.postedAt).setHours(0, 0, 0, 0); // Notice posted date at midnight
      const expireAt = new Date(notice.expireAt).setHours(0, 0, 0, 0); // Notice expiry date at midnight

      // If the notice has expired, it goes to past notices
      if (expireAt < today) {
        pastNotices.push(notice); // Past Notices
      }
      // If today's date falls between postedAt and expireAt (inclusive), it's a present notice
      else if (postedAt <= today && expireAt >= today) {
        presentNotices.push(notice); // Present Notices
      }
      // If the notice is scheduled for a future date (postedAt > today)
      else if (postedAt > today) {
        upcomingNotices.push(notice); // Upcoming Notices
      }
    });

    // Send categorized notices back to the client
    res.status(200).json({
      pastNotices,
      presentNotices,
      upcomingNotices
    });
  } catch (error) {
    console.error('Error fetching teacher notices:', error);
    res.status(500).json({ message: 'Error fetching teacher notices' });
  }
};



const toggleNoticeVisibility = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Toggle the visibility
    notice.isVisibleToStudents = !notice.isVisibleToStudents;
    await notice.save();

    res.status(200).json({ message: 'Notice visibility updated', notice });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};







const getPendingTeachers = async (req, res) => {
    try {
      const pendingTeachers = await Teacher.find({ isApproved: false });
      res.status(200).json(pendingTeachers);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching pending teachers' });
    }
  };

const adminLogin = async (req, res) => {
    const { adminID, password } = req.body;
  
    try {
      const admin = await Admin.findOne({ adminID });
  
      if (!admin) {
        return res.status(400).json({ message: 'Admin not found' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, admin.password);
  
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid password' });
      }
  
      res.status(200).json({ message: 'Login successful' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

const getAllTeachers = async (req, res) => {
  const teachers = await Teacher.find();
  res.json(teachers);
};

const getAdminNotices = async (req, res) => {
  try {
    const notices = await Notice.find(); // Fetch all notices from the database
    res.json(notices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllStudents = async (req, res) => {
  const students = await Student.find();
  res.json(students);
};
const getApprovedTeachers = async (req, res) => {
    try {
      const approvedTeachers = await Teacher.find({ isApproved: true });
      res.status(200).json(approvedTeachers);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching approved teachers' });
    }
  };
module.exports = { toggleNoticeVisibility,getTeacherNoticesForAdmin,deleteAdminNotice,AllAdminNotices,createAdminNotice,getActiveAdminNotices,getApprovedTeachers,getAllTeachers,getAdminNotices, getAllStudents,adminLogin,getPendingTeachers };
