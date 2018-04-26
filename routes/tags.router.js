'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex');

/* ========= GET =======*/
router.get('/tags',(req,res,next) => {
  knex
    .select('id','name')
    .from('tags')
    .then(results => {
      res.json(results)
    })
    .catch(err => next(err));
});

/* ========= GET BY ID=======*/
router.get('/tags/:id',(req,res,next) => {
  const id = req.params.id;
  knex
    .select('id','name')
    .from('tags')
    .where({id : id})    
    .then(results => {
      res.json(results[0]);
    })
    .catch(err => next(err));
});





/* ========= POST =======*/
router.post('/tags',(req,res,next) => {
  const {name} = req.body;

  if(!name){
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newItem = {name};

  knex.insert(newItem)
    .into('tags')
    .returning(['id','name'])
    .then((results) => {
      const result = results[0];
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => next(err));
});




module.exports = router;
