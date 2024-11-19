
const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  text: { type: String, required: true },
  teacherId: { type:String,required :true },
  teacherName:{ type:String,required :true },
  studentId:{type:String,required :true},
  postedAt: { type: Date, required : true, default: Date.now },
  expireAt: { type: Date, required: true }, // Expiration date of the notice
  isVisibleToStudents: { type: Boolean, default: true }
});

const Notice = mongoose.model('Notice', noticeSchema);

module.exports = Notice;
