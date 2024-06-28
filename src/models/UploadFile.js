const mongoose = require('mongoose');

const uploadFileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileType: String,
  fileName: String,
  downloadURL: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UploadFile', uploadFileSchema);
