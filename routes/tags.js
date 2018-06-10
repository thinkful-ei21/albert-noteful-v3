'use strict';

const express = require('express');
const mongoose = require('mongoose');

const Tag = require('../models/tag.js');
const Note = require('../models/note.js');

const router = express.Router();

// GET (read) all tags and sorted by name
router.get('/', (req, res, next) => {
  Tag
    .find()
    .sort({name: 'asc'})
    .then(results => {
      if(results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

// GET (read) a single tag by ID
router.get('/:id', (req, res, next) => {
  const { id } = req.params;

  if(!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error();
    err.message = 'Error: Invalid tag ID';
    err.status = 400;
    return next(err);
  }

  Tag
    .findById(id)
    .then(result => {
      if(result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

// POST (create) a new tag
router.post('/', (req, res, next) => {
  const { name } = req.body;
  const newTag = {name};

  if(!name) {
    const err = new Error();
    err.message = 'Error: Missing `name` in request body.';
    err.status = 400;
    return next(err);
  }

  Tag
    .create(newTag)
    .then(result => {
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      if(err.code === 11000) {
        err = new Error();
        err.message = 'Error: Tag name already in use.';
        err.status = 400;
        return next(err);
      }
      next(err);
    });
});

// PUT (update) an existing tag by ID
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  const updateTag = {name};

  if(!name) {
    const err = new Error();
    err.message = 'Error: Missing `name` in request body.';
    err.status = 400;
    return next(err);
  }
  if(!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error();
    err.message = 'Error: Invalid tag ID.';
    err.status = 400;
    return next(err);
  }

  Tag
    .findByIdAndUpdate(id, updateTag, {new: true})
    .then(result => {
      if(result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      if(err.code === 11000) {
        err = new Error();
        err.message = 'Error: Tag name already in use.';
        err.status = 400;
        return next(err);
      }
      next(err);
    });
});

// DELETE (delete) a single tag by ID
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  if(!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error();
    err.message = 'Error: Invalid tag ID.';
    err.status = 400;
    return next(err);
  }

  // my solution: ON DELETE CASCADE
  // Tag
  //   .findByIdAndRemove(id)
  //   .then(() => {
  //     console.log(`Deleted tag ID ${id}`);
  //     res
  //       .status(204)
  //       .end();
  //   })
  //   .then(() => {
  //     Note.deleteMany({tags: id});
  //   })
  //   .catch(err => next(err));

  // better solution: ON DELETE SET NULL
  const removeTagPromise = Tag.findByIdAndRemove(id);
  const removeNoteTagPromise = Note.updateMany(
    {tags: id},
    {$pull: {tags: id}}
  );

  Promise
    .all([removeTagPromise, removeNoteTagPromise])
    .then(() => {
      console.log(`Deleted tag ID ${id}`);
      res
        .status(204)
        .end();
    })
    .catch(err => next(err));
});

module.exports = router;
