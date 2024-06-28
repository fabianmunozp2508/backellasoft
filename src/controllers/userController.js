const User = require('../models/User');
const DataRegister = require('../models/DataRegister');
const FamilyInfo = require('../models/FamilyInfo');
const UploadFile = require('../models/UploadFile');
const AdditionalInfo = require('../models/AdditionalInfo');
const TutorsInfo = require('../models/TutorsInfo');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { validationResult } = require('express-validator');

// Actualizar los datos de un usuario específico
exports.updateUserData = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, dataToUpdate } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    Object.keys(dataToUpdate).forEach(key => {
      user[key] = dataToUpdate[key];
    });

    await user.save();
    res.json({ message: 'User data updated successfully' });
  } catch (error) {
    console.error('Error updating user data:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Obtener datos del usuario
exports.getUserData = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error getting user data:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Obtener todos los usuarios con límite
exports.getAllUsersLimit = async (req, res) => {
  const { lastId, limit } = req.query;
  const limitValue = parseInt(limit, 10) || 50;

  try {
    let usersQuery = User.find();

    if (lastId) {
      usersQuery = usersQuery.where('_id').gt(lastId);
    }

    const users = await usersQuery.limit(limitValue).exec();

    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Eliminar un usuario y todas sus subcolecciones
exports.deleteUserAndCollections = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await DataRegister.deleteMany({ userId });
    await FamilyInfo.deleteMany({ userId });
    await UploadFile.deleteMany({ userId });
    await AdditionalInfo.deleteMany({ userId });
    await TutorsInfo.deleteMany({ userId });

    await user.remove();

    res.json({ message: 'User and subcollections deleted successfully' });
  } catch (error) {
    console.error('Error deleting user and subcollections:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Función para actualizar datos en subcolecciones
exports.updateSubcollectionData = async (req, res) => {
  const { userId, collectionName, dataToUpdate } = req.body;

  try {
    const subcollectionModel = getModelByCollectionName(collectionName);
    if (!subcollectionModel) {
      return res.status(400).json({ message: 'Invalid collection name' });
    }

    const document = await subcollectionModel.findOneAndUpdate(
      { userId },
      { $set: dataToUpdate },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({ message: 'Subcollection data updated successfully', data: document });
  } catch (error) {
    console.error(`Error updating subcollection data for collection ${collectionName}:`, error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Función para obtener datos de subcolecciones adicionales
exports.getAdditionalCollectionsData = async (req, res) => {
  const { userId, collectionNames } = req.body;

  try {
    const additionalData = {};
    let isEmptyCollectionPresent = false;

    for (const collectionName of collectionNames) {
      const subcollectionModel = getModelByCollectionName(collectionName);
      if (!subcollectionModel) {
        return res.status(400).json({ message: 'Invalid collection name' });
      }

      const collectionData = await subcollectionModel.find({ userId });
      if (collectionData.length === 0) {
        isEmptyCollectionPresent = true;
        break;
      }

      additionalData[collectionName] = collectionData;
    }

    if (isEmptyCollectionPresent) {
      return res.status(404).json({ message: `User ${userId} does not have one or more required subcollections` });
    }

    res.json(additionalData);
  } catch (error) {
    console.error('Error getting additional collections data:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Función para obtener el modelo de subcolección basado en el nombre de la colección
const getModelByCollectionName = (collectionName) => {
  switch (collectionName) {
    case 'dataRegister':
      return DataRegister;
    case 'familyInfo':
      return FamilyInfo;
    case 'files':
      return UploadFile;
    case 'additionalInfo':
      return AdditionalInfo;
    case 'tutorsInfo':
      return TutorsInfo;
    default:
      return null;
  }
};
