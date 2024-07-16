const mongoose = require('mongoose');

const FilesSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentDocument: { type: String },
  tutorDocument: { type: String },
  consignmentReceipt: { type: String }
});

module.exports = mongoose.model('Files', FilesSchema);
