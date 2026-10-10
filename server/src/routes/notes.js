const express = require('express');
const Note = require('../models/Note');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const EDITABLE_FIELDS = ['title', 'content', 'tags', 'pinned'];

function pick(body) {
  return EDITABLE_FIELDS.reduce((acc, key) => {
    if (body[key] !== undefined) acc[key] = body[key];
    return acc;
  }, {});
}

// GET /api/notes?search=&tag=&page=&limit=
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const filter = { owner: req.userId };

    if (req.query.tag) filter.tags = req.query.tag.toLowerCase();
    if (req.query.search) {
      const regex = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: regex }, { content: regex }];
    }

    const [items, total] = await Promise.all([
      Note.find(filter)
        .sort({ pinned: -1, updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Note.countDocuments(filter),
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (err) {
    next(err);
  }
});

// POST /api/notes
router.post('/', async (req, res, next) => {
  try {
    const note = await Note.create({ ...pick(req.body), owner: req.userId });
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
});

// GET /api/notes/:id
router.get('/:id', async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.userId });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    return res.json(note);
  } catch (err) {
    return next(err);
  }
});

// PATCH /api/notes/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      pick(req.body),
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    return res.json(note);
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/notes/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
