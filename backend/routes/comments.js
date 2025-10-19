const express = require('express');
const router = express.Router();
const db = require('../models');
const { protect, isApproved } = require('../middleware/auth');

// @route   POST /api/comments
// @desc    Add comment to note
// @access  Private (Approved users only)
router.post('/', protect, isApproved, async (req, res) => {
  try {
    const { content, noteId } = req.body;

    if (!content || !noteId) {
      return res.status(400).json({ message: 'Content and noteId are required' });
    }

    // Check if note exists
    const note = await db.Note.findByPk(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const comment = await db.Comment.create({
      content,
      userId: req.user.id,
      noteId
    });

    const commentWithUser = await db.Comment.findByPk(comment.id, {
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['id', 'name']
      }]
    });

    res.status(201).json({
      message: 'Comment added successfully',
      comment: commentWithUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete comment
// @access  Private (Owner or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await db.Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is owner or admin
    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.destroy();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

