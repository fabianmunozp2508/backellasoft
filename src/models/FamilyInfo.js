const mongoose = require('mongoose');

const FamilyInfoSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  fatherName: { type: String, required: true },
  motherName: { type: String, required: true },
  siblings: { type: Number, required: true },
  livingWith: { type: String, required: true },
  stratum: { type: Number, required: true },
  residenceAddress: { type: String, required: true }
});

module.exports = mongoose.model('FamilyInfo', FamilyInfoSchema);
