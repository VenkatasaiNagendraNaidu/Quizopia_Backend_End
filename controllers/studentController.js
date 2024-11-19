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

  try {
    const teacher = await Teacher.findOne({ 'quizzes._id': quizID }, { quizzes: 1, firstName: 1, lastName: 1 });
    if (!teacher) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Extract the specific quiz
    const quiz = teacher.quizzes.id(quizID);

    res.status(200).json({
      quizName: quiz.quizName,
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
      questions: quiz.questions,
      quizID:quiz._id,
      quizStartTime:quiz.quizStartTime,
      quizEndTime:quiz.quizDate,
      quizDate:quiz.quizDate
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
  const quizID = req.params.quizID;
  console.log(quizID);
  
  const { studentAnswers, studentID } = req.body; // Expecting student answers and student ID

  try {
    // Find the quiz in the teacher's document
    const teacher = await Teacher.findOne({ 'quizzes._id': quizID });
    if (!teacher) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const quiz = teacher.quizzes.id(quizID);

    // Calculate score
    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (question.correctAnswer === studentAnswers[index]) {
        score++;
      }
    });

    const totalQuestions = quiz.questions.length;
    const percentageScore = (score / totalQuestions) * 100;

    // Generate the PDF with the score
    const pdfFileName = `quiz-result-${studentID}-${quizID}.pdf`;
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(`./public/reports/${pdfFileName}`)); // Save the PDF file in the public folder

    doc.fontSize(18).text(`Quiz Results: ${quiz.quizName}`, { align: 'center' });
    doc.text(``, 20);
    doc.fontSize(14).text(`Student ID: ${studentID}`, 100);
    doc.text(`Score: ${score} / ${totalQuestions}`, 100);
    doc.text(`Percentage: ${percentageScore.toFixed(2)}%`, 100);
    doc.text(`Date: ${new Date().toLocaleString()}`, 100);

    doc.end(); // Close the PDF document

    // Save the result to student's history (optional)
    // You can store this result in the student's record if needed

    res.status(200).json({
      message: 'Quiz submitted successfully!',
      score: score,
      totalQuestions: totalQuestions,
      pdfURL: `/reports/${pdfFileName}`, // URL to download the PDF
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error submitting quiz' });
  }
};


module.exports = { submitQuiz,getQuizById,getQuizzesForStudents,signupStudent,studentLogin,getNotices,getScorecard };