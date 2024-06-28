const { validationResult } = require('express-validator');
const DataRegister = require('../models/DataRegister');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configurar multer para la carga de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
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

exports.saveSiteConfiguration = [
  upload.fields([
    { name: 'logoFile', maxCount: 1 },
    { name: 'bannerFile', maxCount: 1 },
    { name: 'firmaRectorFile', maxCount: 1 },
    { name: 'firmaCoordFile', maxCount: 1 }
  ]),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      institutionName,
      sedeInputs,
      informAcademic
    } = req.body;

    const logoFile = req.files.logoFile ? req.files.logoFile[0] : null;
    const bannerFile = req.files.bannerFile ? req.files.bannerFile[0] : null;
    const firmaRectorFile = req.files.firmaRectorFile ? req.files.firmaRectorFile[0] : null;
    const firmaCoordFile = req.files.firmaCoordFile ? req.files.firmaCoordFile[0] : null;

    try {
      const configurationId = 'unique-configuration-id';
      const configurationDocRef = doc(db, 'configurationSite', configurationId);

      const docSnap = await getDoc(configurationDocRef);
      let existingData = docSnap.exists() ? docSnap.data() : {};

      // Asegúrate de que existingData.sedes siempre esté definido como un array
      if (!Array.isArray(existingData.sedes)) {
        existingData.sedes = [];
      }

      let updateData = {};
      if (institutionName && institutionName !== existingData.institutionName) {
        updateData.institutionName = institutionName;
      }

      if (informAcademic && informAcademic !== existingData.informAcademic) {
        updateData.informAcademic = informAcademic;
      }

      if (logoFile) {
        updateData.logoUrl = '/uploads/' + logoFile.filename;
      } else if (!logoFile && existingData.logoUrl) {
        updateData.logoUrl = existingData.logoUrl;
      }

      if (bannerFile) {
        updateData.bannerUrl = '/uploads/' + bannerFile.filename;
      } else if (!bannerFile && existingData.bannerUrl) {
        updateData.bannerUrl = existingData.bannerUrl;
      }

      if (firmaRectorFile) {
        updateData.firmaRectorUrl = '/uploads/' + firmaRectorFile.filename;
      } else if (!firmaRectorFile && existingData.firmaRectorUrl) {
        updateData.firmaRectorUrl = existingData.firmaRectorUrl;
      }

      if (firmaCoordFile) {
        updateData.firmaCoordUrl = '/uploads/' + firmaCoordFile.filename;
      } else if (!firmaCoordFile && existingData.firmaCoordUrl) {
        updateData.firmaCoordUrl = existingData.firmaCoordUrl;
      }

      if (Object.keys(updateData).length > 0) {
        await setDoc(configurationDocRef, updateData, { merge: true });
      }

      // Manejar la actualización de sedes como una adición a un array
      if (sedeInputs && sedeInputs.length > 0) {
        const uniqueSedes = sedeInputs.filter(sede => !existingData.sedes.includes(sede));
        await updateDoc(configurationDocRef, {
          sedes: arrayUnion(...uniqueSedes)
        });
      }

      return res.status(200).json({ success: true, message: 'Configuración del sitio guardada exitosamente.' });
    } catch (error) {
      console.error('Error al guardar la configuración del sitio:', error.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
];
