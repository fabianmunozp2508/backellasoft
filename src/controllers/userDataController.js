const { Pool } = require('pg');
const DataRegister = require('../models/DataRegister');
const AdditionalInfo = require('../models/AdditionalInfo');
const TutorsInfo = require('../models/TutorsInfo');
const FamilyInfo = require('../models/FamilyInfo');
const config = require('config');
const pool = new Pool({ connectionString: config.get('postgresURI') });

exports.getUserData = async (req, res) => {
  const { userId } = req.params;
  const tenantId = req.tenant_id;

  try {
    const client = await pool.connect();
    const userResult = await client.query('SELECT * FROM public."Users" WHERE id = $1 AND tenant_id = $2', [userId, tenantId]);
    client.release();

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];
    const dataRegister = await DataRegister.findOne({ userId, tenantId }).exec();
    const additionalInfo = await AdditionalInfo.findOne({ studentId: dataRegister.studentId, tenantId }).exec();
    const tutorsInfo = await TutorsInfo.findOne({ studentId: dataRegister.studentId, tenantId }).exec();
    const familyInfo = await FamilyInfo.findOne({ studentId: dataRegister.studentId, tenantId }).exec();

    res.json({
      userData: {
        ...user,
        ...dataRegister._doc,
        ...additionalInfo._doc,
        ...tutorsInfo._doc,
        ...familyInfo._doc
      }
    });
  } catch (err) {
    console.error('Error fetching user data:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDocenteData = async (req, res) => {
  const { docenteId } = req.params;
  try {
    const docenteData = await DataRegister.findOne({ userId: docenteId }).exec();
    if (!docenteData) {
      return res.status(404).json({ message: 'Docente not found' });
    }
    res.json({ docenteData });
  } catch (err) {
    console.error('Error fetching docente data:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTodosDocentesData = async (req, res) => {
  try {
    const docentesData = await DataRegister.find({ role: 'docente' }).exec();
    res.json({ docentesData });
  } catch (err) {
    console.error('Error fetching todos docentes data:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
