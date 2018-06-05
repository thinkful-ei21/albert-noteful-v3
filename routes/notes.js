'use strict';

const express = require('express');
const mongoose = require('mongoose');

const Note = require('../models/note');

const router = express.Router();

/* ========== GET/READ ALL ITEM ========== */
router.get('/', (req, res, next) => {
  const { searchTerm } = req.query;
  let filter = {};

  if (searchTerm) {
    filter.title = {$regex: searchTerm};
  }

  Note
    .find(filter)
    .sort({updatedAt: 'desc'})
    .then(results => res.json(results))
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
  const id = req.params.id;

  Note
    .findById(id)
    .then(result => res.json(result))
    .catch(err => next(err));

  // console.log('Get a Note');
  // res.json({ id: 1, title: 'Temp 1' });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const { title, content } = req.body;
  const newNote = {title, content};

  Note
    .create(newNote)
    .then(result => res.json(result))
    .catch(err => next(err));

  // console.log('Create a Note');
  // res.location('path/to/new/document').status(201).json({ id: 2, title: 'Temp 2' });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const { title, content } = req.body;
  const updateNote = {title, content};

  Note
    .findByIdAndUpdate(id, updateNote, {new: true})
    .then(result => res.json(result))
    .catch(err => next(err));

  // console.log('Update a Note');
  // res.json({ id: 1, title: 'Updated Temp 1' });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  Note
    .findByIdAndRemove(id)
    .then(() => {
      console.log('Deleted note id:' + id);
      res.status(204).end();
    })
    .catch(err => next(err));
  // console.log('Delete a Note');
  // res.status(204).end();
});

module.exports = router;