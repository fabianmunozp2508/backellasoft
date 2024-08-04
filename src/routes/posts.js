const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Post = require('../models/Post');
const authMiddleware = require('../middleware/auth');

// Crear una publicación
router.post('/', [
  authMiddleware,
  body('content').notEmpty().withMessage('El contenido no puede estar vacío')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { content } = req.body;
  const { user } = req;

  try {
    const post = await Post.create({
      content,
      user_id: user.id,
      tenant_id: user.tenant_id
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la publicación' });
  }
});

// Obtener todas las publicaciones
router.get('/', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.findAll({ where: { tenant_id: req.user.tenant_id } });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las publicaciones' });
  }
});

module.exports = router;
