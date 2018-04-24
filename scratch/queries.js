'use strict';

const knex = require('../knex');

let id = 1001;
let newItem = { title: 'title test', content: ' testing -content'};
knex  
  .from('notes')
  .where({ id :id})
  .del()  
  .then(results => console.log(JSON.stringify(results)))
  .catch(err => { console.error(err)});