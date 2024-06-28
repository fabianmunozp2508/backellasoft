const mongoose = require('mongoose');

const additionalInfoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  previousSchool: String,
  academicReport: String,
  sedeMatricula: String,
  studentFromPreviousInstitution: Boolean,
  repeatAcademicYear: Boolean,
  hasAllergy: Boolean,
  allergy: String,
  bloodType: String,
  hasDisease: Boolean,
  disease: String,
  medicalExam: String,
  grade: String
});

module.exports = mongoose.model('AdditionalInfo', additionalInfoSchema);
