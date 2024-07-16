const mongoose = require('mongoose');

const TutorsInfoSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  tutors: { type: Array, required: true }
});

module.exports = mongoose.model('TutorsInfo', TutorsInfoSchema);
