const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configurar multer para la carga de archivos con nombres únicos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads')); // Asegurar que la ruta es correcta
  },
  filename: function (req, file, cb) {
    // Generar un nombre único utilizando un hash
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Aceptar solo archivos de imagen
  if (!file.mimetype.startsWith('image')) {
    return cb(new Error('File is not an image'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 // Limitar el tamaño del archivo a 1MB
  }
});

// @route   POST /api/upload
// @desc    Upload photo
// @access  Public
router.post('/', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const photoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: photoUrl });
});

module.exports = router;
