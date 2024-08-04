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
const subdomain = require('express-subdomain');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const https = require('https');
const tenantMiddleware = require('./middleware/tenantMiddleware');
require('dotenv').config();

const config = require('config');

const app = express();

// Middleware de registro de solicitudes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Configurar multer para la carga de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
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
router.use('/password-reset', require('./routes/passwordReset'));
router.use('/reset-password', require('./routes/resetPassword'));

// Aquí aplicamos el tenantMiddleware solo a las rutas que lo necesitan
const tenantRequiredRoutes = express.Router();
tenantRequiredRoutes.use(tenantMiddleware);
tenantRequiredRoutes.use('/site-config', require('./routes/siteConfig'));
tenantRequiredRoutes.use('/user-data', require('./routes/userData'));

// Rutas de la red social
tenantRequiredRoutes.use('/posts', require('./routes/posts'));
tenantRequiredRoutes.use('/comments', require('./routes/comments'));
tenantRequiredRoutes.use('/likes', require('./routes/likes'));

app.use(subdomain('*', router));
app.use(subdomain('*', tenantRequiredRoutes));

// Manejo de errores global
app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).json({ message: 'Server Error' });
});

// Configuración HTTPS
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '../certificates/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../certificates/cert.pem'))
};

const PORT = config.get('port') || 5000;
https.createServer(httpsOptions, app).listen(PORT, '0.0.0.0', () => {
  logger.info(`HTTPS Server is running on port ${PORT}`);
});

// Sincronizar modelos
const User = require('./models/User');
const Institution = require('./models/Institution');
const EducationalSite = require('./models/EducationalSite');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Like = require('./models/Like');

sequelize.sync().then(() => {
  console.log('PostgreSQL synchronized');
}).catch(err => {
  console.error('Error synchronizing PostgreSQL:', err);
});
