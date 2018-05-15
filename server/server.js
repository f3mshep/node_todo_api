const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require("mongodb");

const {mongoose} = require('./db/mongo');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const app = express();
PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

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
  let id = req.params.id;
  if (!ObjectID.isValid(id)) return res.status(400).send({error: "Invalid Id"})
  Todo.findById(id)
    .then(todo => {
      if (!todo) return res.status(404).send({error: "Object not found"})
      res.send({todo})
    }, error => {
      res.send({error})
    });
});

app.listen(PORT, () => {
  console.log(`Started on port ${PORT}`)
});

module.exports = {app}