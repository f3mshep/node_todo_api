const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongo');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

const id = '5af9cf6b039bb40752e0b482';

User.findById(id)
  .then((user)=>{
    if (!user) return console.log('ID not found')
    console.log('User: ', user)
  }).catch(e => console.log(e))
