const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('./../../models/todo');
const { User } = require("./../../models/user");

const firstEmail = "testing123@gmail.com";
const validTestId = "5afa1983aca2950c3963665a";
const badValidTestId = "5afa1983aca2950c3963665b";
const userOneId = new ObjectId()
const userTwoId = new ObjectId()

SECRET = process.env.JWT_SECRET

const users = [{
  _id: userOneId,
  email: firstEmail,
  password: "password",
  tokens:[{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, SECRET).toString()
  }]
},{
  _id: userTwoId,
  email: 'testing456@gmail.com',
  password: 'password',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userTwoId, access: 'auth' }, SECRET).toString()
  }]
}]

const todos = [
  { text: "First test", _creator: userOneId, _id: new ObjectId() },
  { text: "Second test", _creator: userOneId },
  { text: "Third test", _id: validTestId, _creator: userTwoId }
];

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
}

const populateUsers = (done) => {
  User.remove({}).then(()=> {
    let userOne = new User(users[0]).save();
    let userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo])

  }).then(()=> done());
};


module.exports = {
  todos,
  populateTodos,
  validTestId,
  badValidTestId,
  users,
  populateUsers
};