'use strict';

const knex = require('../knex');
const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

// Get All (and search by query)
router.get('/notes', (req, res, next) => {
  const { searchTerm,folderId } = req.query;  
  knex.select('notes.id', 'title', 'content', 'folders.id as folder_id', 'folders.name as folderName')
  .from('notes')
  .leftJoin('folders', 'notes.folder_id', 'folders.id')
  .modify(function (queryBuilder) {
    if (searchTerm) {
      queryBuilder.where('title', 'like', `%${searchTerm}%`);
    }
  })
  .modify(function (queryBuilder) {
    if (folderId) {
      queryBuilder.where('folder_id', folderId);
    }
  })
  .orderBy('notes.id')
  .then(results => {
    res.json(results).end();
  })
  .catch(err => next(err));  
});

// Get a single item
router.get('/notes/:id', (req, res, next) => {
  const id = req.params.id;
  knex
  .select('notes.id', 'title', 'content')
  .from('notes')
  .where({ id :id})
  .then(results => {
    if(results.length >0) {
      res.json(results[0])
    }
    else{
      next();
    }    
    })
  .catch(err => console.error(err));
});

// Put update an item
router.put('/notes/:id', (req, res, next) => {
  const noteId = req.params.id;  

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content', 'folder_id'];
  const newUpdateObjFields =['title', 'content'];
  console.log('request body', req.body);
  updateableFields.forEach(field => {
    if (field in req.body) {      
      updateObj[field] = req.body[field];      
    }
  });

  /***** Never trust users - validate input *****/
  if (!updateObj.title) {    
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }    

  knex('notes')
  .update(updateObj)
  .where('id', noteId) //{}
  .returning(['id'])
  .then(() => { 
    // Using the noteId, select the note and the folder info
    return knex.select('notes.id', 'title', 'content', 'folder_id', 'folders.name as folderName')
      .from('notes')
      .leftJoin('folders', 'notes.folder_id', 'folders.id')
      .where('notes.id', noteId);
  })
  .then(([result]) => {
    if (result) {
      res.json(result);
    } else {
      next();
    }
  })
  .catch(err => next(err));
});

// Post (insert) an item
router.post('/notes', (req, res, next) => {
  const { title, content, folderId} = req.body;

  const newItem = {
    title: title,
    content: content,
    folder_id: (folderId)? folderId : null
  };

  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  let noteId;
  knex
  .insert(newItem)
  .into('notes')  
  .returning('id')
  .then(([id]) => {
    noteId = id;
    //using new id to select note and the folder
    return knex.select('notes.id', 'title', 'content', 'folder_id', 'folders.name as folder_name')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id') 
        .where('notes.id', noteId);  
    })
    .then(([result]) => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
  })
  .catch(err => console.error(err)); 
});

// Delete an item
router.delete('/notes/:id', (req, res, next) => {
  const id = req.params.id;
  knex  
  .from('notes')
  .where({ id :id})
  .del()  
  .then(results => res.sendStatus(204).end())
  .catch(err => console.error(err));
});


module.exports = router;
