'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config.js');
const Note = require('../models/note.js');

const seedNotes = require('../db/seed/notes.json');

mongoose.connect(MONGODB_URI)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => Note.insertMany(seedNotes))
  .then(results => {
    console.info(`Inserted ${results.length} Notes`);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(err);
  });
