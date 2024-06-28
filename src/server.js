process.env.NODE_CONFIG_DIR = __dirname + '/config';

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const connectPostgres = require('./config/db_postgres');
const logger = require('./utils/logger');
const path = require('path');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
require('express-async-errors');

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(helmet());
app.use(mongoSanitize());

// Limitar el número de solicitudes a la API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // Limitar cada IP a 100 solicitudes por ventana de 15 minutos
});
app.use(limiter);

// Carpeta para las subidas de archivos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Conectar a las bases de datos
connectDB();
connectPostgres();

// Definir una ruta de prueba
app.get('/', (req, res) => res.send('API Running'));

// Definir rutas de la API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/register', require('./routes/register'));
app.use('/api/config', require('./routes/config'));
// app.use('/api/users', require('./routes/users'));

// Manejo de errores global
app.use((err, req, res, next) => {
  logger.error(err.message);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: 'File upload error' });
  }
  res.status(500).json({ message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
