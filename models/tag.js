'use strict';

const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

// Add 'createdAt' and 'updatedAt' fields
tagSchema.set('timestamps', true);

// Customize the mongoose document instance being returned
tagSchema.set('toObject', {
  virtuals: true, // include built-in virtual 'id'
  versionKey: false, // remove '__v' version key
  transform: (doc, ret) => {
    delete ret._id; // delete '_id'
  }
});

module.exports = mongoose.model('Tag', tagSchema);
