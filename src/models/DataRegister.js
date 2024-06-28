const mongoose = require('mongoose');

const dataRegisterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: String,
  lastName: String,
  address: String,
  phoneNumber: String,
  documentType: String,
  documentNumber: String,
  expeditionDepartment: String,
  expeditionCity: String,
  birthDate: Date,
  photo: String,
  matriculationDate: Date
});

module.exports = mongoose.model('DataRegister', dataRegisterSchema);
