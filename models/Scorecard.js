const mongoose = require('mongoose');

const ScorecardSchema = new mongoose.Schema({
  quizName:{type: String,required:true},
  studentId: { type: String,required:true },
  quizId: { type: String, required: true },
  postedBy:{type: String, required: true},
  QuizDate:{type: Date, required: true},
  startTime:{type:Date, required:true},
  EndTime : {type:Date, required:true},
  pdfUrl:{type:String,required:true},
  score: { type: Number, required: true },
  percentage:{type:Number,required:true}
});

module.exports = mongoose.model('Scorecard', ScorecardSchema);
