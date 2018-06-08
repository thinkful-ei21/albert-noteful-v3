'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config.js');

const Folder = require('../models/folder.js');
const Tag = require('../models/tag.js');
const Note = require('../models/note.js');

const seedFolders = require('../db/seed/folders.json');
const seedTags = require('../db/seed/tags.json');
const seedNotes = require('../db/seed/notes.json');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.info('Dropping Database');
    return mongoose.connection.db.dropDatabase();
  })
  .then(() => {
    console.info('Seeding Database');
    return Promise.all([
      Note.insertMany(seedNotes),

      Folder.insertMany(seedFolders),
      Tag.insertMany(seedTags),

      // By default, mongodb index data automatically.
      // But calling .createIndexes() here tells Mongo to start indexing immediately.
      // Index enforces the {unique: true} rule created in the schema.
      Folder.createIndexes(),
      Tag.createIndexes()
    ]);
  })
  .then(() => {
    console.info('Disconnecting');
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
    db.disconnect();
  });