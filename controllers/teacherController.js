const Teacher = require('../models/Teacher');
const Notice = require('../models/Notice');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const sendMail = require('../services/nodemailer');
const nodemailer = require('nodemailer');


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
  

  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });
  
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
  
      const mailOptions = {
        from: process.env.EMAIL_USER, 
        to: teacher.email, 
        subject: 'Teacher Access Approved',
        text: `Dear ${teacher.firstName} ${teacher.lastName},\n\nYour access has been approved.\nYour Teacher ID: ${teacher.teacherID}\nGenerated Password: ${password}\n\nPlease log in to the platform using these credentials.\n\nBest regards,\nQuiz Platform Admin`,
      };
  
      // Send the email
      await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ message: 'Error sending email' });
        }
        console.log('Email sent:', info.response);
      });
  
      console.log(`Teacher ID: ${teacher.teacherID}, Generated Password: ${password}`);
      res.status(200).json({ message: 'Teacher approved successfully' });
    } catch (error) {
      console.error('Error approving teacher:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  
  const declineTeacher = async (req, res) => {
    try {
      const teacher = await Teacher.findById(req.params.id);
  
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
  
      const teacherEmail = teacher.email;
  
      await Teacher.findByIdAndDelete(req.params.id);
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: teacherEmail,
        subject: 'Teacher Access Declined',
        text: `Dear ${teacher.firstName} ${teacher.lastName},\n\nYour request for access to the platform has been declined.\n\nBest regards,\nQuiz Platform Admin`,
      };
  
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ message: 'Teacher declined, but error sending email' });
        }
        console.log('Decline email sent:', info.response);
        return res.status(200).json({ message: 'Teacher declined and email sent' });
      });
  
    } catch (error) {
      console.error('Error declining teacher:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  


  const getTeacherProfile = async (req, res) => {
    try {
        const { teacherID } = req.params;  // Get the teacherID from the request parameters
        const teacher = await Teacher.findOne({ teacherID });  // Find teacher by teacherID

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        res.json({
            name: `${teacher.firstName} ${teacher.lastName}`,
            email: teacher.email,
            qualification: teacher.qualification,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};



const getTeacherQuizzes = async (req, res) => {
  try {
    const { teacherID } = req.params;
    const teacher = await Teacher.findOne({ teacherID });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const now = new Date(); // Current time

    // Categorize quizzes into past, present (ongoing), and upcoming
    const pastQuizzes = [];
    const ongoingQuizzes = [];
    const upcomingQuizzes = [];

    teacher.quizzes.forEach(quiz => {
      const quizStartTime = new Date(quiz.quizStartTime);
      const quizEndTime = new Date(quiz.quizEndTime);

      if (quizEndTime < now) {
        // Quiz has ended, it's in the past
        pastQuizzes.push(quiz);
      } else if (quizStartTime <= now && quizEndTime >= now) {
        // Quiz is ongoing (between start and end time)
        ongoingQuizzes.push(quiz);
      } else if (quizStartTime > now) {
        // Quiz is upcoming
        upcomingQuizzes.push(quiz);
      }
    });

    // Send categorized quizzes back to the client
    res.status(200).json({
      pastQuizzes,
      ongoingQuizzes,
      upcomingQuizzes,
    });
  } catch (error) {
    console.error('Error fetching teacher quizzes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


  
  const postNotice = async (req, res) => {
    console.log(req.body.notice, req.body.teacherID);
    
    try {
      // Step 1: Save the notice
      
  
      // Step 2: Fetch the teacher's data including the students list
      const teacher = await Teacher.findOne({ teacherID: req.body.teacherID }).populate('students');
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
      console.log(teacher.students);
      
      const noticesPromises = teacher.students.map(async (student) => {
        const newNotice = new Notice({
          text: req.body.notice,
          teacherId: req.body.teacherID,
          teacherName: `${teacher.firstName} ${teacher.lastName}`,
          studentId: student.studentID, // Assuming each student has a studentID field
          postedAt: req.body.postedAt,
          expireAt : req.body.expireAt,
        });
      await newNotice.save();
      });
      // Step 3: Set up Nodemailer transporter with .env variables
      const transporter = nodemailer.createTransport({
        service: 'gmail', // Use your email service
        auth: {
          user: process.env.EMAIL_USER, // Access email from .env
          pass: process.env.EMAIL_PASS,  // Access password from .env
        },
      });
  console.log(teacher.students);
  
      // Step 4: Loop through teacher's students and send email
      const emailPromises = teacher.students.map(async (student) => {
        const mailOptions = {
          from: process.env.EMAIL_USER,  // Sender email from .env
          to: student.studentEmail,  // Email of the student
          subject: 'New Notice from ' + teacher.firstName + ' ' + teacher.lastName,
          text: `Dear ${student.studentName},
  
  Your Teacher ${teacher.firstName} ${teacher.lastName} has posted a new notice. Please check your dashboard for more details.
  
  Best regards,
  Quiz Platform Team`,
        };
  
        // Send the email and return a promise
        return transporter.sendMail(mailOptions);
      });
  
      // Step 5: Wait for all emails to be sent
      await Promise.all(emailPromises);
  
      // Step 6: Send response after successfully sending emails
      res.status(201).json({ message: 'Notice posted and emails sent to students successfully' });
    } catch (error) {
      console.error('Error posting notice or sending emails:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  module.exports = { postNotice };
  

  const sendNotificationToStudents = async (req, res) => {
    try {
      const students = await Student.find(); // Get all students
      // Send email notifications to each student (you can integrate Nodemailer here)
      students.forEach(async (student) => {
        await sendMail(
          student.email, 
          'New Notification', 
          req.body.notificationText
        );
      });
      res.status(200).json({ message: 'Notification sent to all students.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  const saveQuiz = async (req, res) => {
    const { questions, quizName, quizDate, combinedDateTime, teacherID } = req.body;
    
    try {
      const teacher = await Teacher.findOne({ teacherID }); // Find the teacher by teacherID
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
  
      const formattedQuestions = questions.map(question => ({
        question: question.Question,
        options: [
          question.Option1,
          question.Option2,
          question.Option3,
          question.Option4,
        ],
        correctAnswer: question.CorrectAnswer
      }));
  
      // Calculate quizEndTime by adding 1 hour to the quizStartTime
      const quizEndTime = new Date(combinedDateTime);
      quizEndTime.setHours(quizEndTime.getHours() + 1);
  
      // Create the new quiz object
      const newQuiz = {
        quizName,
        quizDate,
        quizStartTime: combinedDateTime,
        quizEndTime,
        questions: formattedQuestions,
      };
  
      // Add the quiz to the teacher's quizzes array
      teacher.quizzes.push(newQuiz);
      
      // Save the updated teacher document
      await teacher.save();
  
      // Get the ID of the newly added quiz
      const quizID = teacher.quizzes[teacher.quizzes.length - 1]._id;
  
      // Find the students associated with this teacher and update their quizzes array
      const students = teacher.students; // Assuming 'students' is an array of { studentID, studentName, ... }
  
      for (const student of students) {
        await Student.findOneAndUpdate(
          { studentID: student.studentID },
          {
            $push: {
              quizzes: {
                quizID,
                quizName,
                studentScore: 0, // Initial score
                attempted: false // Initially not attempted
              }
            }
          }
        );
      }
  
      console.log(`Quiz saved for teacher ${teacherID} and added to students: ${students.length} students.`);
  
      res.status(201).json({ message: 'Quiz saved and assigned to students successfully!' });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error saving quiz' });
    }
  };
  
  
  
  const deleteQuiz = async (req, res) => {
    console.log(req.body);
    const { quizID } = req.params;
    const { teacherID } = req.body; // Ensure that you pass the teacherID with the request
    
  
    try {
      // Find the teacher by teacherID
      const teacher = await Teacher.findOne({ teacherID });
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
  
      // Find and remove the quiz from the teacher's quizzes array
      teacher.quizzes = teacher.quizzes.filter(quiz => quiz._id.toString() !== quizID);
  
      // Save the updated teacher document
      await teacher.save();
  
      res.status(200).json({ message: 'Quiz deleted successfully!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error deleting quiz' });
    }
  };

  const getNoticesByTeacher = async (req, res) => {
    const  teacherId  = req.params.teacherID; // Get teacherId from request parameters
    console.log(teacherId);
    
  
    try {
      const notices = await Notice.find( {teacherId} ); // Find all notices for the specific teacher
      if (notices.length === 0) {
        return res.status(404).json({ message: 'No notices found for this teacher' });
      }
      res.json(notices); // Return all the notices
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching notices' });
    }
  };
  
  // Delete a specific notice
  const deleteNotice = async (req, res) => {
    const  noticeId = req.params; // Get noticeId from request parameters
    console.log(noticeId);
    
  
    try {
      const notice = await Notice.findByIdAndDelete(noticeId.noticeID); // Delete the notice by ID
      if (!notice) {
        return res.status(404).json({ message: 'Notice not found' });
      }
  
      res.status(200).json({ message: 'Notice deleted successfully!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error deleting notice' });
    }
  };


  // controllers/teacherController.js
  const addStudentToTeacher = async (req, res) => {
    const { studentID, teacherID } = req.body;  // Destructure studentID and teacherID correctly from the request body
    
    try {
      // Find the teacher by teacherID
      const teacher = await Teacher.findOne({ teacherID: teacherID });
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
  
      // Find the student by studentID
      const student = await Student.findOne({ studentID: studentID });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      // Ensure teacher.students is initialized as an array (in case it's null or undefined)
      if (!Array.isArray(teacher.students)) {
        teacher.students = [];
      }
  
      // Clean up any potential `null` values in the teacher's students array
      teacher.students = teacher.students.filter(s => s !== null && s !== undefined);
  
      // Check if the student is already added to the teacher's list
      const isStudentAlreadyAdded = teacher.students.some(
        (s) => s.studentID === studentID  // Checking for matching studentID
      );
      if (isStudentAlreadyAdded) {
        return res.status(400).json({ message: 'Student already added to your list' });
      }
  
      // Add the student to the teacher's list
      teacher.students.push({
        studentID: student.studentID,  // Assuming `studentID` is a field in the student schema
        studentName: student.name,     // Assuming `name` is a field in the student schema
        studentEmail:student.email,
        studentPhone:student.phoneNumber
      });
  
      // Save the updated teacher document
      await teacher.save();
  
      // Return success response
      res.status(200).json({ message: 'Student added to your list successfully!' });
    } catch (error) {
      console.error('Error adding student:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  const getMyStudents = async (req, res) => {
    const { teacherID } = req.params;  // Extract teacherID from the request params
  
    try {
      // Find the teacher by teacherID
      const teacher = await Teacher.findOne({ teacherID: teacherID });
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
  
      // Return the list of students associated with the teacher
      res.status(200).json(teacher.students);  // Return only the students array
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  
  const removeStudentFromTeacher = async (req, res) => {
    const { studentID } = req.body;  // Extract studentID from the request body
    const { teacherID } = req.body;  // Extract teacherID from the request body
    // console.log(req.body);
    
    try {
        // Find the teacher by teacherID
        const teacher = await Teacher.findOne({teacherID});
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
  
        // Find the index of the student in the teacher's students array by matching studentID
        const studentIndex = teacher.students.findIndex(s => s.studentID === studentID);
        if (studentIndex === -1) {
            return res.status(404).json({ message: 'Student not found in your list' });
        }
  
        // Remove the student from the array
        teacher.students.splice(studentIndex, 1);
  
        // Save the updated teacher document
        await teacher.save();
  
        // Return success response
        res.status(200).json({ message: 'Student removed from your list successfully!' });
    } catch (error) {
        console.error('Error removing student:', error);
        res.status(500).json({ message: 'Server error' });
    }
  };
  

 

module.exports = { deleteNotice,getNoticesByTeacher,deleteQuiz,removeStudentFromTeacher,getMyStudents,addStudentToTeacher,saveQuiz,sendNotificationToStudents,postNotice,signupTeacher, approveTeacher, declineTeacher,loginTeacher,getTeacherProfile,getTeacherQuizzes };
