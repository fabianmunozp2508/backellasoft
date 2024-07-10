// models/DataRegister.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DataRegisterSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  documentType: {
    type: String,
    required: true
  },
  documentNumber: {
    type: String,
    required: true
  },
  expeditionDepartment: {
    type: String,
    required: true
  },
  expeditionCity: {
    type: String,
    required: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  photo: {
    type: String,
    required: true
  },
  matriculationDate: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('DataRegister', DataRegisterSchema);
