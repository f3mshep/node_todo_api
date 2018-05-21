require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require("mongodb");
const _ = require('lodash');
const bcryptjs = require('bcryptjs');

const {mongoose} = require('./db/mongo');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

const app = express();
PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Todos
app.post('/todos', authenticate,  (req, res) => {
  let todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  })
  todo.save().then((doc)=>{
    res.send(doc);
  }, (e)=>{
    res.status(400).send(e)
  })
});

app.get('/todos', authenticate, (req, res) => {
  Todo.find({_creator: req.user._id})
    .then(todos => {
      res.send(todos)
    }, error => {
      res.status(400).send({error})
    })
});

app.get('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) return res.status(400).send({error: "Invalid Id"})
  Todo.findOne({_id: id, _creator: req.user._id})
    .then(todo => {
      if (!todo) return res.status(404).send({error: "Object not found"})
      res.send(todo)
    }, error => {
      res.send({error})
    });
});

app.delete(`/todos/:id`, authenticate, (req, res)=>{
  const id = req.params.id;

  Todo.findOneAndRemove({
    _id: id, _creator: req.user._id
  })
    .then(todo => {
      if (!todo) return res.status(404).send({ error: "Object not found" });
      res.send({ todo });
    })
    .catch( (error) => {
      return res.status(400).send(error);
    });
});

app.patch(`/todos/:id`, authenticate, (req, res) => {
  const id = req.params.id;
  const body = _.pick(req.body, ['text', 'completed']);
  if (!ObjectID.isValid(id)) return res.status(400).send({error: "Invalid Id"})

  if (_.isBoolean(body.completed) && body.completed){
    body.completedAt = new Date().getTime();
  }
  else {
    body.completed = false;
    body.completedAt = null;
  };

  Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true})
    .then((todo)=>{
      if(!todo) return res.status(404).send({error: "Object not found"})

      res.send({todo})
    })
    .catch((error)=>{
      return res.status(400).send({error})
    })
});



//User

app.post('/users', (req, res)=>{
  let body = _.pick(req.body, ['email', 'password'])
  let newUser = new User(body);
  newUser.save().then(()=>{
      return newUser.generateAuthToken();
    })
    .then((token)=> {
      return res.header('x-auth', token).send(newUser);
    }).catch((error) => res.status(400).send({error}));
});

app.get('/users/me',authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', (req, res)=>{
  let user = _.pick(req.body, ['email', 'password'])
  User.findByCredentials(user.email, user.password)
    .then(doc => {
      return doc.generateAuthToken()
      .then(token =>{
        res.header('x-auth', token).send(doc)
      });
    })
    .catch(err => res.status(400).send({err}))
});

app.delete('/users/me/token', authenticate, (req, res)=>{
  req.user.removeToken(req.token).then(()=>{
    console.log('sending 200')
    return res.status(200).send()
  })
  .catch(err => {
    return res.status(400).send()
  });
});

//port config

app.listen(PORT, () => {
  console.log(`Started on port ${PORT}`)
});

module.exports = {app}