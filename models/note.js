'use strict';

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: String,
  // createdAt: {
  //   type: Date,
  //   default: new Date(Date.now())
  // },
  // updatedAt: {
  //   type: Date,
  //   default: new Date(Date.now())
  // }
});

// Add `createdAt` and `updatedAt` fields
noteSchema.set('timestamps', true);

// Customize the mongoose document instance being returned
noteSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});

module.exports = mongoose.model('Note', noteSchema);
