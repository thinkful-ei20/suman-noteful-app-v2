'use strict';

const knex = require('../knex');
const express = require('express');
const router = express.Router();

//GET 
router.get('/folders', (req, res, next) => {  
  knex
  .select('id','name' )
  .from('folders')    
  .then(results => res.json(results))
  .catch(err => {
    next(err);
  });
});

// Get a single item
router.get('/folders/:id', (req, res, next) => {
  const id = req.params.id;
  knex
  .select('id','name')
  .from('folders')
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
router.put('/folders/:id', (req, res, next) => {
  const id = req.params.id;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['name'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!updateObj.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  knex
  .update(updateObj)
  .from('folders')
  .where({id :id})
  .returning(['id','name'])
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
router.post('/folders', (req, res, next) => {
  const { name} = req.body;

  const newItem = { name };
  /***** Never trust users - validate input *****/
  if (!newItem.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  knex
  .insert(newItem)
  .into('folders')  
  .returning(['id','name'])
  .then(results => {
    //res.json(results[0]);
    res.location(`http://${req.headers.host}/folders/${results[0].id}`).status(201).json(results[0]);
  })
  .catch(err => console.error(err)); 
});

// Delete an item
router.delete('/folders/:id', (req, res, next) => {
  const id = req.params.id;
  knex  
  .from('folders')
  .where({ id :id})
  .del()  
  .then(results => res.sendStatus(204).end())
  .catch(err => console.error(err));
});

module.exports = router;