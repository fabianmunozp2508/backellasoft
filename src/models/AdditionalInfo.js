const mongoose = require('mongoose');

const AdditionalInfoSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  grade: { type: String, required: true },
  previousSchool: { type: String, required: true },
  sedeMatricula: { type: String, required: true },
  studentFromPreviousInstitution: { type: Boolean, required: true },
  repeatAcademicYear: { type: Boolean, required: true },
  hasAllergy: { type: Boolean, required: true },
  allergy: { type: String },
  bloodType: { type: String, required: true },
  hasDisease: { type: Boolean, required: true },
  disease: { type: String }
});

module.exports = mongoose.model('AdditionalInfo', AdditionalInfoSchema);
