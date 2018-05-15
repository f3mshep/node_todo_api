const { ObjectID } = require("mongodb");

const { mongoose } = require("./../server/db/mongo");
const { Todo } = require("./../server/models/todo");
const { User } = require("./../server/models/user");

const id = "5af9cf6b039bb40752e0b482";

Todo.remove({})