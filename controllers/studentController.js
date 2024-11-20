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
    const { studentId } = req.query; // Get studentId from query parameters
  
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }
  
    try {
      // Find notices that have a matching studentId and where isVisibleToStudents is true
      const notices = await Notice.find({
        studentId: { $eq: studentId }, // Match only if studentId is present and equals the passed studentId
        isVisibleToStudents: true // Only fetch notices that are visible to students
      });
  
      if (notices.length === 0) {
        return res.status(404).json({ message: 'No visible notices found for this student' });
      }
  
      res.status(200).json(notices);
    } catch (error) {
      console.error('Error fetching notices:', error);
      res.status(500).json({ message: 'Error fetching notices', error });
    }
  };
  
  const Teacher = require('../models/Teacher');  // Assuming the Teacher model is in '../models/Teacher'

// Fetch quizzes for students
const getQuizzesForStudents = async (req, res) => {
  try {
    const currentDateTime = new Date();  // Get current date and time
    
    // Fetch all teachers with their quizzes
    const teachers = await Teacher.find().select('firstName lastName quizzes');

    const quizzes = [];

    // Loop through each teacher and their quizzes
    teachers.forEach(teacher => {
      teacher.quizzes.forEach(quiz => {
        // Determine the quiz status based on the current time
        let quizStatus = '';
        if (quiz.quizEndTime < currentDateTime) {
          quizStatus = 'Past';
        } else if (quiz.quizStartTime <= currentDateTime && quiz.quizEndTime >= currentDateTime) {
          quizStatus = 'Ongoing';
        } else if (quiz.quizStartTime > currentDateTime) {
          quizStatus = 'Upcoming';
        }

        // Push relevant quiz info to the array
        quizzes.push({
          quizName: quiz.quizName,
          quizStartTime: quiz.quizStartTime,
          quizEndTime: quiz.quizEndTime,
          quizStatus: quizStatus,
          teacherName: `${teacher.firstName} ${teacher.lastName}`,
          quizID: quiz._id  // You might want this to handle quiz-specific actions like joining
        });
      });
    });

    res.status(200).json(quizzes);  // Return the quizzes to the student
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching quizzes' });
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


const getQuizById = async (req, res) => {
  const { quizID } = req.params;
  const studentID = req.body.studentID;  // Assuming studentID is passed in the request body

  try {
    // Find the teacher that posted this quiz
    const teacher = await Teacher.findOne({ 'quizzes._id': quizID }, { quizzes: 1, firstName: 1, lastName: 1 });
    if (!teacher) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Extract the specific quiz
    const quiz = teacher.quizzes.id(quizID);

    // Find the student and update the quiz record as attempted
    const student = await Student.findOne(studentID);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Find the quiz in the student's record
    const studentQuiz = student.quizzes.find(q => q.quizID === quizID);

    if (studentQuiz) {
      // Update the student's quiz as attempted
      studentQuiz.attempted = true;

      // Save the student record
      await student.save();
    } else {
      return res.status(404).json({ message: 'Quiz not found in student record' });
    }

    // Return the quiz details
    res.status(200).json({
      quizName: quiz.quizName,
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
      questions: quiz.questions,
      quizID: quiz._id,
      quizStartTime: quiz.quizStartTime,
      quizEndTime: quiz.quizEndTime,
      quizDate: quiz.quizDate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching quiz' });
  }
};




const PDFDocument = require('pdfkit');
const fs = require('fs');

// Function to handle quiz submission and calculate score
const submitQuiz = async (req, res) => {
  const { studentID, score, totalQuestions, quizName,pdfUrl,QuizDate, postedBy, startTime, endTime } = req.body;
  const quizID = req.body.quizID;

  try {
    // Calculate percentage (optional)
    const percentage = (score / totalQuestions) * 100;

    // Create a new scorecard entry
    const newScorecard = new Scorecard({
      quizName,
      studentId: studentID,
      quizId: quizID,
      postedBy,
      startTime,
      QuizDate,
      EndTime: endTime,
      score,
      pdfUrl,
      percentage,
    });

    // Save the scorecard to the database
    await newScorecard.save();

    res.status(201).json({
      message: 'Scorecard saved successfully!',
      scorecard: newScorecard,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error saving scorecard',
      error,
    });
  }
};

const scoreCards =async (req, res) => {
  const { studentId } = req.params;
  
  try {
    // Fetch scorecards from the database
    const scorecards = await Scorecard.find({ studentId });
    
    if (!scorecards || scorecards.length === 0) {
      return res.status(404).json({ message: 'No scorecards found' });
    }

    // Return the scorecards as JSON
    res.status(200).json(scorecards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching scorecards' });
  }
};
const getStudentQuizzes = async (req, res) => {
  const studentID = req.body.studentID;
  
  
  try {
    const student = await Student.findOne(studentID);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Return the quizzes array with quizID and attempted status
    res.status(200).json(student.quizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching student quizzes' });
  }
};


module.exports = { getStudentQuizzes,scoreCards,submitQuiz,getQuizById,getQuizzesForStudents,signupStudent,studentLogin,getNotices,getScorecard };