const Institution = require('../models/Institution');
const EducationalSite = require('../models/EducationalSite');
const multer = require('multer');
const path = require('path');

// Configurar multer para la carga de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('File is not an image'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // Limitar el tamaño del archivo a 5MB
  }
});

// Crear una nueva institución
exports.createInstitution = [
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banners', maxCount: 10 },
    { name: 'rectorSignature', maxCount: 1 },
    { name: 'coordinatorSignatures', maxCount: 10 }
  ]),
  async (req, res) => {
    const { name, header_info, contact_address, contact_phone, contact_email, official_website, tenant_id } = req.body;
    const tenantId = req.tenant_id || tenant_id;

    try {
      const logo_url = req.files && req.files['logo'] ? req.files['logo'][0].path : null;
      const banner_urls = req.files && req.files['banners'] ? req.files['banners'].map(file => file.path) : [];
      const rector_signature_url = req.files && req.files['rectorSignature'] ? req.files['rectorSignature'][0].path : null;
      const coordinator_signatures = req.files && req.files['coordinatorSignatures'] ? req.files['coordinatorSignatures'].map(file => file.path) : [];

      const institution = await Institution.create({
        tenant_id: tenantId,
        name,
        logo_url,
        banner_urls,
        rector_signature_url,
        coordinator_signatures,
        header_info,
        contact_address,
        contact_phone,
        contact_email,
        official_website
      });

      res.status(201).json(institution);
    } catch (err) {
      console.error('Error creating institution:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
];


// Crear o actualizar una institución
exports.createOrUpdateInstitution = [
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banners', maxCount: 10 },
    { name: 'rectorSignature', maxCount: 1 },
    { name: 'coordinatorSignatures', maxCount: 10 }
  ]),
  async (req, res) => {
    const { name, header_info, contact_address, contact_phone, contact_email, official_website, tenant_id } = req.body;
    const tenantId = req.tenant_id || tenant_id;

    try {
      const logo_url = req.files && req.files['logo'] ? req.files['logo'][0].path : null;
      const banner_urls = req.files && req.files['banners'] ? req.files['banners'].map(file => file.path) : [];
      const rector_signature_url = req.files && req.files['rectorSignature'] ? req.files['rectorSignature'][0].path : null;
      const coordinator_signatures = req.files && req.files['coordinatorSignatures'] ? req.files['coordinatorSignatures'].map(file => file.path) : [];

      let institution = await Institution.findOne({ where: { tenant_id: tenantId } });

      if (institution) {
        // Actualizar la institución existente
        await institution.update({
          name,
          logo_url: logo_url || institution.logo_url,
          banner_urls: banner_urls.length > 0 ? banner_urls : institution.banner_urls,
          rector_signature_url: rector_signature_url || institution.rector_signature_url,
          coordinator_signatures: coordinator_signatures.length > 0 ? coordinator_signatures : institution.coordinator_signatures,
          header_info,
          contact_address,
          contact_phone,
          contact_email,
          official_website
        });
        res.status(200).json(institution);
      } else {
        // Crear una nueva institución
        institution = await Institution.create({
          tenant_id: tenantId,
          name,
          logo_url,
          banner_urls,
          rector_signature_url,
          coordinator_signatures,
          header_info,
          contact_address,
          contact_phone,
          contact_email,
          official_website
        });
        res.status(201).json(institution);
      }
    } catch (err) {
      console.error('Error creating or updating institution:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

// Crear una nueva sede educativa
exports.createEducationalSite = async (req, res) => {
  const { institution_id, name, address, tenant_id } = req.body;
  const tenantId = req.tenant_id || tenant_id;

  try {
    const educationalSite = await EducationalSite.create({
      tenant_id: tenantId,
      institution_id,
      name,
      address
    });
    res.status(201).json(educationalSite);
  } catch (err) {
    console.error('Error creating educational site:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Obtener la información de una institución
exports.getInstitution = async (req, res) => {
  const tenantId = req.tenant_id;

  try {
    const institution = await Institution.findOne({
      where: { tenant_id: tenantId }
    });
    res.status(200).json(institution);
  } catch (err) {
    console.error('Error fetching institution:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Actualizar la información de una institución
exports.updateInstitution = [
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banners', maxCount: 10 },
    { name: 'rectorSignature', maxCount: 1 },
    { name: 'coordinatorSignatures', maxCount: 10 }
  ]),
  async (req, res) => {
    const { name, header_info, contact_address, contact_phone, contact_email, official_website, tenant_id } = req.body;
    const tenantId = req.tenant_id || tenant_id;

    try {
      const institution = await Institution.findOne({
        where: { tenant_id: tenantId }
      });

      if (!institution) {
        return res.status(404).json({ message: 'Institution not found' });
      }

      const logo_url = req.files && req.files['logo'] ? req.files['logo'][0].path : institution.logo_url;
      const banner_urls = req.files && req.files['banners'] ? req.files['banners'].map(file => file.path) : institution.banner_urls;
      const rector_signature_url = req.files && req.files['rectorSignature'] ? req.files['rectorSignature'][0].path : institution.rector_signature_url;
      const coordinator_signatures = req.files && req.files['coordinatorSignatures'] ? req.files['coordinatorSignatures'].map(file => file.path) : institution.coordinator_signatures;

      await institution.update({
        name,
        logo_url,
        banner_urls,
        rector_signature_url,
        coordinator_signatures,
        header_info,
        contact_address,
        contact_phone,
        contact_email,
        official_website
      });

      res.status(200).json(institution);
    } catch (err) {
      console.error('Error updating institution:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

// Eliminar una institución
exports.deleteInstitution = async (req, res) => {
  const tenantId = req.tenant_id;

  try {
    const institution = await Institution.findOne({
      where: { tenant_id: tenantId }
    });

    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    await institution.destroy();
    res.status(204).json({ message: 'Institution deleted' });
  } catch (err) {
    console.error('Error deleting institution:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Obtener todas las sedes educativas de una institución
exports.getEducationalSites = async (req, res) => {
  const tenantId = req.tenant_id;

  try {
    const educationalSites = await EducationalSite.findAll({
      where: { tenant_id: tenantId }
    });
    res.status(200).json(educationalSites);
  } catch (err) {
    console.error('Error fetching educational sites:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Actualizar una sede educativa
exports.updateEducationalSite = async (req, res) => {
  const { id, name, address, tenant_id } = req.body;
  const tenantId = req.tenant_id || tenant_id;

  try {
    const educationalSite = await EducationalSite.findOne({
      where: { id, tenant_id: tenantId }
    });

    if (!educationalSite) {
      return res.status(404).json({ message: 'Educational site not found' });
    }

    await educationalSite.update({
      name,
      address
    });

    res.status(200).json(educationalSite);
  } catch (err) {
    console.error('Error updating educational site:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Eliminar una sede educativa
exports.deleteEducationalSite = async (req, res) => {
  const { id } = req.body;
  const tenantId = req.tenant_id;

  try {
    const educationalSite = await EducationalSite.findOne({
      where: { id, tenant_id: tenantId }
    });

    if (!educationalSite) {
      return res.status(404).json({ message: 'Educational site not found' });
    }

    await educationalSite.destroy();
    res.status(204).json({ message: 'Educational site deleted' });
  } catch (err) {
    console.error('Error deleting educational site:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeSede = async (req, res) => {
  const { sedeName } = req.body;
  const tenantId = req.tenant_id;

  try {
    const institution = await Institution.findOne({ where: { tenant_id: tenantId } });

    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    const updatedSedes = institution.sedes.filter(sede => sede !== sedeName);
    await institution.update({ sedes: updatedSedes });

    res.status(200).json({ success: true, message: 'Sede eliminada exitosamente.' });
  } catch (err) {
    console.error('Error removing sede:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeLogo = async (req, res) => {
  const tenantId = req.tenant_id;

  try {
    const institution = await Institution.findOne({ where: { tenant_id: tenantId } });

    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    await institution.update({ logo_url: '' });

    res.status(200).json({ success: true, message: 'Logo eliminado exitosamente.' });
  } catch (err) {
    console.error('Error removing logo:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeBanner = async (req, res) => {
  const tenantId = req.tenant_id;

  try {
    const institution = await Institution.findOne({ where: { tenant_id: tenantId } });

    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    await institution.update({ banner_urls: [] });

    res.status(200).json({ success: true, message: 'Banner eliminado exitosamente.' });
  } catch (err) {
    console.error('Error removing banner:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeSignature = async (req, res) => {
  const { signatureType } = req.params;
  const tenantId = req.tenant_id;

  try {
    const institution = await Institution.findOne({ where: { tenant_id: tenantId } });

    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    const updateData = {};
    if (signatureType === 'rectorSignature') {
      updateData.rector_signature_url = '';
    } else if (signatureType.startsWith('coordinatorSignature')) {
      const index = parseInt(signatureType.replace('coordinatorSignature', ''), 10);
      if (Number.isInteger(index)) {
        const updatedSignatures = institution.coordinator_signatures;
        updatedSignatures[index] = '';
        updateData.coordinator_signatures = updatedSignatures;
      }
    }

    await institution.update(updateData);

    res.status(200).json({ success: true, message: `${signatureType} eliminada exitosamente.` });
  } catch (err) {
    console.error(`Error removing ${signatureType}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
};
