'use strict';

const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const searchTerm = 'lady gaga';
//     let filter = {};
//     if (searchTerm) {
//       filter.title = { $regex: searchTerm };
//     }
//     return Note.find(filter).sort({ updatedAt: 'desc' });
//   })    
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });


// Find by ID
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     return Note.findById('000000000000000000000002');
//   })    
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });


// Create a new note
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const newNote = {
//       'title': 'sample title text',
//       'content': 'sample content text'
//     };
//     return Note.create(newNote);
//   })    
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });


// Update note by Id
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const updateId = '000000000000000000000004';
//     const updateNote = {
//       'title': 'sample title update',
//       'content': 'sample content update'
//     };
//     return Note.findByIdAndUpdate(updateId, updateNote, {new: true});
//   })    
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });
  
// Delete note by Id
mongoose.connect(MONGODB_URI)
  .then(() => {
    const removeId = '000000000000000000000006';
    return Note.findByIdAndRemove(removeId); // must have return keyword even on deletion
  })    
  .then(() => {
    console.log('Note removed.');
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });
