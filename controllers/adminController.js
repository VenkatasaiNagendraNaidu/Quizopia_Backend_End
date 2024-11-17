const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const bcrypt = require('bcrypt');

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
module.exports = { getApprovedTeachers,getAllTeachers, getAllStudents,adminLogin,getPendingTeachers };
