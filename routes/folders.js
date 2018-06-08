'use strict';

const express = require('express');
const mongoose = require('mongoose');

const Folder = require('../models/folder.js');
const Note = require('../models/note.js');

const router = express.Router();

// GET (read) all folders and sorted by name
router.get('/', (req, res, next) => {
  Folder
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

// GET (read) a single folder by ID
router.get('/:id', (req, res, next) => {
  const { id } = req.params;

  if(!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error();
    err.message = 'Error: Invalid folder ID.';
    err.status = 400;
    return next(err);
  }

  Folder
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

// POST (create) a new folder
router.post('/', (req, res, next) => {
  const { name } = req.body;
  const newFolder = { name };

  if(!name) {
    const err = new Error();
    err.message = 'Error: Missing `name` in request body.';
    err.status = 400;
    return next(err);
  }

  Folder
    .create(newFolder)
    .then(result => {
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      if(err.code === 11000) {
        err = new Error();
        err.message = 'Error: Folder name already in use.';
        err.status = 400;
      }
      next(err);
    });
});

// PUT (update) a folder by ID
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  const updateFolder = {name};

  if(!name) {
    const err = new Error();
    err.message = 'Error: Missing `name` in request body.';
    err.status = 400;
    return next(err);
  }
  if(!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error();
    err.message = 'Error: Invalid folder ID.';
    err.status = 400;
    return next(err);
  }

  Folder
    .findByIdAndUpdate(id, updateFolder, {new: true})
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
        err.message = 'Error: Folder name already in use.';
        err.status = 400;
      }
      next(err);
    });
});

// DELETE (delete) a folder by ID
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  if(!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error();
    err.message = 'Error: Invalid folder ID.';
    err.status = 400;
    return next(err);
  }

  // my solution: ON DELETE CASCADE
  // Folder
  //   .findByIdAndRemove(id)
  //   .then(() => {
  //     console.log(`Deleted folder ID ${id}`);
  //     res
  //       .status(204)
  //       .end();
  //   })
  //   .then(() => {
  //     Note.deleteMany({folderId: id});
  //   })
  //   .catch(err => next(err));

  // better solution: ON DELETE SET NULL
  const removeFolderPromise = Folder.findByIdAndRemove(id);
  // ON DELETE CASCADE equivalent
  // const removeNoteFolderPromise = Note.deleteMany({folderId: id});
  // ON DELETE SET NULL equivalent
  const removeNoteFolderPromise = Note.updateMany(
    {folderId: id},
    {$unset: {folderId: ''}} // review!!!
  );

  Promise
    .all([removeFolderPromise, removeNoteFolderPromise])
    .then(() => {
      console.log(`Deleted folder ID ${id}`);
      res
        .status(204)
        .end();
    })
    .catch(err => next(err));
});

module.exports = router;
