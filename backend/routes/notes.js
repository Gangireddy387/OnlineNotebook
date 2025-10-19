const express = require('express');
const router = express.Router();
const db = require('../models');
const { protect, isApproved } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// @route   GET /api/notes
// @desc    Get all notes with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { collegeId, departmentId, subjectId, search, page = 1, limit = 10 } = req.query;

    const where = {};
    if (collegeId) where.collegeId = collegeId;
    if (departmentId) where.departmentId = departmentId;
    if (subjectId) where.subjectId = subjectId;
    
    if (search) {
      where[db.Sequelize.Op.or] = [
        { title: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        { description: { [db.Sequelize.Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: notes } = await db.Note.findAndCountAll({
      where,
      include: [
        {
          model: db.User,
          attributes: ['id', 'name', 'collegeName']
        },
        {
          model: db.College,
          attributes: ['id', 'name']
        },
        {
          model: db.Department,
          attributes: ['id', 'name']
        },
        {
          model: db.Subject,
          attributes: ['id', 'name', 'code']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      notes,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/notes/:id
// @desc    Get single note
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const note = await db.Note.findByPk(req.params.id, {
      include: [
        {
          model: db.User,
          attributes: ['id', 'name', 'collegeName', 'department']
        },
        {
          model: db.College,
          attributes: ['id', 'name']
        },
        {
          model: db.Department,
          attributes: ['id', 'name']
        },
        {
          model: db.Subject,
          attributes: ['id', 'name', 'code']
        },
        {
          model: db.Comment,
          include: [{
            model: db.User,
            attributes: ['id', 'name']
          }],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ note });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/notes
// @desc    Create new note
// @access  Private (Approved users only)
router.post('/', protect, isApproved, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { title, description, collegeId, departmentId, subjectId, tags } = req.body;

    const note = await db.Note.create({
      title,
      description,
      userId: req.user.id,
      collegeId: collegeId || null,
      departmentId: departmentId || null,
      subjectId: subjectId || null,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      tags: tags ? JSON.parse(tags) : []
    });

    const noteWithDetails = await db.Note.findByPk(note.id, {
      include: [
        { model: db.User, attributes: ['id', 'name'] },
        { model: db.College, attributes: ['id', 'name'] },
        { model: db.Department, attributes: ['id', 'name'] },
        { model: db.Subject, attributes: ['id', 'name'] }
      ]
    });

    res.status(201).json({
      message: 'Note uploaded successfully',
      note: noteWithDetails
    });
  } catch (error) {
    console.error(error);
    // Delete uploaded file if database insert fails
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete note
// @access  Private (Owner or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await db.Note.findByPk(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if user is owner or admin
    if (note.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this note' });
    }

    // Delete file from filesystem
    if (fs.existsSync(note.filePath)) {
      fs.unlinkSync(note.filePath);
    }

    await note.destroy();

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/notes/:id/preview
// @desc    Preview note file (view without downloading)
// @access  Public
router.get('/:id/preview', async (req, res) => {
  try {
    const note = await db.Note.findByPk(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (!fs.existsSync(note.filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Set content type and disposition for inline viewing
    res.setHeader('Content-Type', note.fileType);
    res.setHeader('Content-Disposition', `inline; filename="${note.fileName}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(note.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/notes/:id/download
// @desc    Download note file
// @access  Public
router.get('/:id/download', async (req, res) => {
  try {
    const note = await db.Note.findByPk(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (!fs.existsSync(note.filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Increment download count
    note.downloads += 1;
    await note.save();

    res.download(note.filePath, note.fileName);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

