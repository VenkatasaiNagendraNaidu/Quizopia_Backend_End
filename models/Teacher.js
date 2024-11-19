const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  suffix: String,
  firstName: String,
  lastName: String,
  dob: Date,
  age: Number,
  qualification: String,
  classTaught: String,
  phoneNumber: String,
  email: { type: String, required: true, unique: true },
  teacherID: { type: String, unique: true },  
  password: String, 
  isApproved: { type: Boolean, default: false },
  students: [{ studentID: String, studentName: String, studentEmail: String, studentPhone: String }],
  quizzes: [{
    quizName: String,
    scheduledTime: Date, // this will be removed
    quizDate: Date, // Quiz Date
    quizStartTime: Date, // Quiz Start Time
    quizEndTime: Date, // Quiz End Time
    questions: [{
      question: String,
      options: [String],
      correctAnswer: String,
    }]
  }]
}, {
  timestamps: true
});


teacherSchema.pre('save', function (next) {
  if (this.isNew) { 
    this.teacherID = `${this.firstName.toUpperCase()}-${Date.now().toString().slice(-6)}`; 
  }
  next();
});

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;
