const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  type: { type: String, enum: ['teacher', 'upcoming', 'ongoing', 'past'], required: true },
  date: { type: Date, required: true },
  score: { type: Number, default: 0 },
});

module.exports = mongoose.model('Quiz', QuizSchema);
