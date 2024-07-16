const mongoose = require('mongoose');

const DataRegisterSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  userId: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  lastName: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  documentType: { type: String, required: true },
  documentNumber: { type: String, required: true },
  expeditionDepartment: { type: String, required: true },
  expeditionCity: { type: String, required: true },
  birthDate: { type: Date, required: true },
  photo: { type: String },
  matriculationDate: { type: Date, required: true }
});

module.exports = mongoose.model('DataRegister', DataRegisterSchema);
