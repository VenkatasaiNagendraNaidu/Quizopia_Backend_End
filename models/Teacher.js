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
  students: [{ studentID: String, studentName: String }],
  quizzes: [{
    quizName: String,
    scheduledTime: Date,
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
