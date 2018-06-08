'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config.js');

const Folder = require('../models/folder.js');
const Note = require('../models/note.js');

const seedFolders = require('../db/seed/folders.json');
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
      
      // This tells Mongo to index the Folders data immediately.
      // Index is used enforce the unique folder names rule you created in the schema.
      Folder.createIndexes(),
      Folder.insertMany(seedFolders),
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