const multer = require('multer');
const path = require('path');

// Configurar multer para la carga de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads')); // Ruta corregida para los archivos
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
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
