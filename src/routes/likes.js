const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Like = require('../models/Like');
const authMiddleware = require('../middleware/auth');

// Dar "me gusta" a una publicación
router.post('/', [
  authMiddleware,
  body('post_id').notEmpty().withMessage('El ID de la publicación es requerido')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { post_id } = req.body;
  const { user } = req;

  try {
    const like = await Like.create({
      post_id,
      user_id: user.id
    });

    res.status(201).json(like);
  } catch (error) {
    res.status(500).json({ message: 'Error al dar "me gusta"' });
  }
});

// Obtener "me gusta" de una publicación
router.get('/:postId', authMiddleware, async (req, res) => {
  try {
    const likes = await Like.findAll({ where: { post_id: req.params.postId } });
    res.json(likes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los "me gusta"' });
  }
});

module.exports = router;
