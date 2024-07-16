// server.js
process.env.NODE_CONFIG_DIR = __dirname + '/config';
require('dotenv').config(); // Asegúrate de que esto esté al principio del archivo

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const path = require('path');
const connectMongoDB = require('./config/db'); // Importar la conexión a MongoDB
const sequelize = require('./config/db_postgres'); // Importar la conexión a PostgreSQL
const tenantMiddleware = require('./middleware/tenantMiddleware'); // Importar el middleware de tenant

const app = express();

// Conectar a MongoDB
connectMongoDB();

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

// Middleware para manejar el tenant basado en el subdominio
app.use(tenantMiddleware);

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/prematriculados', require('./routes/prematriculados'));
app.use('/api/register', require('./routes/register'));
app.use('/api/upload', require('./routes/upload'));

// Manejo de errores global
app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).json({ message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

// Sincronizar modelos
const User = require('./models/User');

sequelize.sync().then(() => {
  console.log('PostgreSQL synchronized');
}).catch(err => {
  console.error('Error synchronizing PostgreSQL:', err);
});
