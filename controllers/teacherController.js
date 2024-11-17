const Teacher = require('../models/Teacher');
const bcrypt = require('bcryptjs');
const sendMail = require('../services/nodemailer');


const loginTeacher = async (req, res) => {
    const { teacherID, password } = req.body;
  
    try {
      const teacher = await Teacher.findOne({ teacherID });
  
      if (!teacher) {
        return res.status(400).json({ message: 'Invalid Teacher ID or Password' });
      }
  
      const isMatch = await bcrypt.compare(password, teacher.password);
  
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid Teacher ID or Password' });
      }
  
      res.status(200).json({ message: 'Login successful', teacherID: teacher.teacherID, teacherName: `${teacher.firstName} ${teacher.lastName}` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  };
  

const signupTeacher = async (req, res) => {
    const { suffix, firstName, lastName, dob, age, qualification, classTaught, phoneNumber, email } = req.body;
  
    try {
      const teacher = new Teacher({ 
        suffix, 
        firstName, 
        lastName, 
        dob, 
        age, 
        qualification, 
        classTaught, 
        phoneNumber, 
        email 
      });
  
      const savedTeacher = await teacher.save();
  
      res.status(201).json(savedTeacher);
    } catch (error) {
      console.error('Error saving teacher:', error);
      res.status(500).json({ message: 'Error saving teacher', error });
    }
  };
  

const approveTeacher = async (req, res) => {
    try {
      console.log('Teacher ID:', req.params.id); 
  
      const teacher = await Teacher.findById(req.params.id);
  
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
  
      const password = Math.random().toString(36).slice(-8); 
      teacher.password = await bcrypt.hash(password, 10); 
      teacher.isApproved = true; 
  
      await teacher.save();
  
      console.log(`Teacher ID: ${teacher.teacherID}, Generated Password: ${password}`);
  
      res.status(200).json({ message: 'Teacher approved successfully' });
    } catch (error) {
      console.error('Error approving teacher:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

const declineTeacher = async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);

  if (teacher) {
    await teacher.remove();
    await sendMail(teacher.email, 'Teacher Access Declined', 'Your request for access has been declined.');
    res.status(200).json({ message: 'Teacher declined' });
  } else {
    res.status(404).json({ message: 'Teacher not found' });
  }
};

module.exports = { signupTeacher, approveTeacher, declineTeacher,loginTeacher };
