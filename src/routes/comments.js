const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Comment = require('../models/Comment');
const authMiddleware = require('../middleware/auth');

// Crear un comentario
router.post('/', [
  authMiddleware,
  body('post_id').notEmpty().withMessage('El ID de la publicación es requerido'),
  body('content').notEmpty().withMessage('El contenido no puede estar vacío')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { post_id, content } = req.body;
  const { user } = req;

  try {
    const comment = await Comment.create({
      post_id,
      content,
      user_id: user.id
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el comentario' });
  }
});

// Obtener comentarios de una publicación
router.get('/:postId', authMiddleware, async (req, res) => {
  try {
    const comments = await Comment.findAll({ where: { post_id: req.params.postId } });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los comentarios' });
  }
});

module.exports = router;
