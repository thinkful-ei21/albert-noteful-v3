'use strict';

const express = require('express');
const mongoose = require('mongoose');

const Note = require('../models/note.js');

const router = express.Router();

/* ========== GET/READ ALL ITEM ========== */
router.get('/', (req, res, next) => {
  const { searchTerm, folderId, tagId } = req.query;
  let filter = {};

  if(searchTerm) {
    filter.title = {$regex: searchTerm};
  }
  if(folderId) {
    filter.folderId = folderId;
  }
  if(tagId) {
    filter.tags = tagId;
  }

  Note
    .find(filter)
    .populate('tags')
    .sort({updatedAt: 'desc'})
    .then(results => {
      if(results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => next(err));

  // console.log('Get All Notes');
  // res.json([
  //   { id: 1, title: 'Temp 1' },
  //   { id: 2, title: 'Temp 2' },
  //   { id: 3, title: 'Temp 3' }
  // ]);
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const { id } = req.params;

  if(!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error();
    err.message = 'Error: Invalid note ID.';
    err.status = 400;
    return next(err);
  }

  Note
    .findById(id)
    .populate('tags')
    .then(result => {
      if(result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => next(err));

  // console.log('Get a Note');
  // res.json({ id: 1, title: 'Temp 1' });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const { title, content, folderId, tags = [] } = req.body;
  const newNote = { title, content, folderId, tags };

  /***** Never trust users - validate input *****/
  if(!title) {
    const err = new Error();
    err.message = 'Error: Missing `title` in request body';
    err.status = 400;
    return next(err);
  }
  if(folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error();
    err.message = 'Error: Invalid folder ID.';
    err.status = 400;
    return next(err);
  }
  if(tags) {
    tags.forEach(tag => {
      if(!mongoose.Types.ObjectId.isValid(tag)) {
        const err = new Error();
        err.message = 'Error: Invalid tag Id.';
        err.status = 400;
        return next(err);
      }
    });
  }

  Note
    .create(newNote)
    .then(result => {
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => next(err));

  // console.log('Create a Note');
  // res.location('path/to/new/document').status(201).json({ id: 2, title: 'Temp 2' });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { title, content, folderId, tags = [] } = req.body;
  const updateNote = {title, content, folderId, tags};

  if(!title) {
    const err = new Error();
    err.message = 'Missing `title` in request body';
    err.status = 400;
    return next(err);
  }
  if(!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error();
    err.message = 'Error: Invalid note ID.';
    err.status = 400;
    return next(err);
  }
  if(folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error();
    err.message = 'Error: Invalid folder ID.';
    err.status = 400;
    return next(err);
  }
  if(tags) {
    tags.forEach(tag => {
      if(!mongoose.Types.ObjectId.isValid(tag)) {
        const err = new Error();
        err.message = 'Error: Invalid tag ID.';
        err.status = 400;
        return next(err);
      }
    });
  }

  Note
    .findByIdAndUpdate(id, updateNote, {new: true})
    .then(result => {
      if(result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => next(err));

  // console.log('Update a Note');
  // res.json({ id: 1, title: 'Updated Temp 1' });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  if(!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error();
    err.message = 'Error: Invalid folder ID.';
    err.status = 400;
    return next(err);
  }

  Note
    .findByIdAndRemove(id)
    .then(() => {
      console.log(`Deleted note ID ${id}`);
      res
        .status(204)
        .end();
    })
    .catch(err => next(err));
  // console.log('Delete a Note');
  // res.status(204).end();
});

module.exports = router;
