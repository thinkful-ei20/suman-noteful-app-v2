'use strict';

const knex = require('../knex');
const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

// Get All (and search by query)
router.get('/notes', (req, res, next) => {
  const { searchTerm } = req.query;  
  knex
  .select('notes.id', 'title', 'content')
  .from('notes')
  .modify(queryBuilder => {
    if (searchTerm) {
      queryBuilder.where('title', 'like', `%${searchTerm}%`);
    }
  })  
  .then(results => res.json(results))
  .catch(err => {
    next(err);
  });
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
      res.json(results)
    }
    else{
      next();
    }    
    })
  .catch(err => console.error(err));
});

// Put update an item
router.put('/notes/:id', (req, res, next) => {
  const id = req.params.id;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content'];

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

  knex
  .update(updateObj)
  .from('notes')
  .where({ id :id})
  .returning(['id','title','content'])
  .then(results => {    
      if(results.length >0) {
        res.json(results)
      }
      else{
        next();
      }          
  })
  .catch(err => { console.error(err)});
});

// Post (insert) an item
router.post('/notes', (req, res, next) => {
  const { title, content } = req.body;

  const newItem = { title, content };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex
  .insert(newItem)
  .from('notes')  
  .returning(['id','title','content'])
  .then(results => {
    res.location(`http://${req.headers.host}/notes/${results[0].id}`).status(201).json(results);
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
