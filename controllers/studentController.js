const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const sendMail = require('../services/nodemailer');
const Notice = require('../models/Notice');
const Quiz = require('../models/Quiz');
const Scorecard = require('../models/Scorecard');

const signupStudent = async (req, res) => {
  const { name, classStudying, dob, email, phoneNumber } = req.body;
  const password = Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(password, 10);

  const student = new Student({ name, classStudying, dob, email, phoneNumber, studentID: email.split('@')[0], password: hashedPassword });

  try {
    const savedStudent = await student.save();
    await sendMail(email, 'Student Access', `Your account has been created. Student ID: ${student.studentID}, Password: ${password}`);
    console.log(password);
    
    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Error signing up student', error });
  }
};


const studentLogin = async (req, res) => {
    const { studentID, password } = req.body;
  
    if (!studentID || !password) {
      return res.status(400).json({ message: 'Student ID and password are required' });
    }
  
    try {
      const student = await Student.findOne({ studentID });
  
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      const isMatch = await bcrypt.compare(password, student.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid password' });
      }
  
      res.status(200).json({ message: 'Login successful', student });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find();
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notices', error });
  }
};

const getTeacherQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ teacher: req.user.id, type: 'teacher' });
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teacher quizzes', error });
  }
};

const getUpcomingQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ type: 'upcoming' }).sort({ date: 1 });
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching upcoming quizzes', error });
  }
};

const getOngoingQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ type: 'ongoing' });
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ongoing quizzes', error });
  }
};

const getPastQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ type: 'past' }).sort({ date: -1 });
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching past quizzes', error });
  }
};

const getScorecard = async (req, res) => {
  try {
    const scorecards = await Scorecard.find({ studentId: req.user.id }).populate('quiz');
    res.status(200).json(scorecards);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching scorecard', error });
  }
};


module.exports = { signupStudent,studentLogin,getNotices,getScorecard,getPastQuizzes,getOngoingQuizzes,getTeacherQuizzes,getUpcomingQuizzes };
