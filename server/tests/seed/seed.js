const { ObjectId } = require('mongodb');

const { Todo } = require('./../../models/todo');

const validTestId = "5afa1983aca2950c3963665a";
const badValidTestId = "5afa1983aca2950c3963665b";

const todos = [
  { text: "First test" },
  { text: "Second test" },
  { text: "Third test", _id: validTestId }
];

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
}



module.exports = {
  todos,
  populateTodos,
  validTestId,
  badValidTestId
};