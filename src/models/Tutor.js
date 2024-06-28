const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: String,
  lastName: String,
  email: String,
  relation: String,
  relationOther: String,
  photo: String
});

module.exports = mongoose.model('Tutor', tutorSchema);
