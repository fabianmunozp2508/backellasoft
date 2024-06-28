const mongoose = require('mongoose');

const familyInfoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fatherName: String,
  motherName: String,
  siblings: Number,
  livingWith: String,
  stratum: String,
  residenceAddress: String
});

module.exports = mongoose.model('FamilyInfo', familyInfoSchema);
