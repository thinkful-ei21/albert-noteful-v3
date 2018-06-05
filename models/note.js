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
