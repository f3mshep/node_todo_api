const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongo');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const app = express();
PORT = 3000

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  let todo = new Todo({
    text: req.body.text
  })
  todo.save().then((doc)=>{
    console.log("Document created:\n", doc)
    res.send(doc);
  }, (e)=>{
    console.log("Bad request:\n", e)
    res.status(400).send(e)
  })
});

app.get('/todos', (req, res) => {

});

app.listen(PORT, () => {
  console.log(`Started on port ${PORT}`)
});