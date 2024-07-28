const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const path = require('path');
const connectMongoDB = require('../config/db_mongo');
const sequelize = require('../config/db_postgres');
const tenantMiddleware = require('./middleware/tenantMiddleware');
const subdomain = require('express-subdomain');
require('dotenv').config();

const config = require('config');

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
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Middleware para manejar el tenant basado en el subdominio
app.use(tenantMiddleware);

// Rutas
const router = express.Router();
router.use('/auth', require('./routes/auth'));
router.use('/prematriculados', require('./routes/prematriculados'));
router.use('/register', require('./routes/register'));
router.use('/upload', require('./routes/upload'));
router.use('/user-status', require('./routes/userStatus'));
router.use('/site-config', require('./routes/siteConfig'));
router.use('/user-data', require('./routes/userData'));
router.use('/password-reset', require('./routes/passwordReset'));

app.use(subdomain('*', router));

// Manejo de errores global
app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).json({ message: 'Server Error' });
});

const PORT = config.get('port') || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

// Sincronizar modelos
const User = require('./models/User');
const UserInstitutionalStatus = require('./models/UserInstitutionalStatus');
const Institution = require('./models/Institution');
const EducationalSite = require('./models/EducationalSite');

sequelize.sync().then(() => {
  console.log('PostgreSQL synchronized');
}).catch(err => {
  console.error('Error synchronizing PostgreSQL:', err);
});
