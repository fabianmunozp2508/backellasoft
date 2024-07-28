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
const multer = require('multer');
const crypto = require('crypto');
require('dotenv').config();

const config = require('config');

const app = express();

// Configurar multer para la carga de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads')); // Ruta corregida para los archivos
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Conectar a MongoDB
connectMongoDB();

// Servir archivos estáticos desde la carpeta public en src
app.use(express.static(path.join(__dirname, '../public')));

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
router.use('/register', upload.fields([
  { name: 'academicReport', maxCount: 1 },
  { name: 'studentDocument', maxCount: 1 },
  { name: 'tutorDocument', maxCount: 1 },
  { name: 'consignmentReceipt', maxCount: 1 },
  { name: 'photo', maxCount: 1 }
]), require('./routes/register'));
router.use('/upload', require('./routes/upload'));
router.use('/user-status', require('./routes/userStatus'));
router.use('/site-config', require('./routes/siteConfig'));
router.use('/user-data', require('./routes/userData'));
router.use('/password-reset', require('./routes/passwordReset'));
router.use('/reset-password', require('./routes/resetPassword'));

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
