// src/config/db_mongo.js
const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
  let retries = 5;
  while (retries) {
    try {
      await mongoose.connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('MongoDB connected...');
      break;
    } catch (err) {
      console.error('Error connecting to MongoDB:', err.message);
      retries -= 1;
      console.log(`Retries left: ${retries}`);
      await new Promise(res => setTimeout(res, 5000)); // Esperar 5 segundos antes de reintentar
    }
  }
  if (!retries) {
    process.exit(1);
  }
};

module.exports = connectDB;
