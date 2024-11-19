const mongoose = require('mongoose');

const adminNoticeSchema = new mongoose.Schema({
  text: { type: String, required: true },
  adminId: { type: String, required: true }, // Assuming admin notices are posted by an admin
  postedAt: { type: Date, required: true, default: Date.now }, // Date when the notice was posted
  expireAt: { type: Date, required: true }, // Expiration date of the notice
});

const AdminNotice = mongoose.model('AdminNotice', adminNoticeSchema);

module.exports = AdminNotice;
