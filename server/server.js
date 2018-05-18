require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require("mongodb");
const _ = require('lodash');

const {mongoose} = require('./db/mongo');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

const app = express();
PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Todos
app.post('/todos', (req, res) => {
  let todo = new Todo({
    text: req.body.text
  })
  todo.save().then((doc)=>{
    res.send(doc);
  }, (e)=>{
    res.status(400).send(e)
  })
});

app.get('/todos', (req, res) => {
  Todo.find({})
    .then(todos => {
      res.send({todos})
    }, error => {
      res.status(400).send({error})
    })
});

app.get('/todos/:id', (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) return res.status(400).send({error: "Invalid Id"})
  Todo.findById(id)
    .then(todo => {
      if (!todo) return res.status(404).send({error: "Object not found"})
      res.send({todo})
    }, error => {
      res.send({error})
    });
});

app.delete(`/todos/:id`, (req, res)=>{
  const id = req.params.id;

  Todo.findByIdAndRemove(id)
    .then(todo => {
      if (!todo) return res.status(404).send({ error: "Object not found" });
      res.send({ todo });
    })
    .catch( (error) => {
      return res.status(400).send(error);
    });
});

app.patch(`/todos/:id`, (req, res) => {
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

  Todo.findOneAndUpdate(id, {$set: body}, {new: true})
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

app.listen(PORT, () => {
  console.log(`Started on port ${PORT}`)
});

module.exports = {app}