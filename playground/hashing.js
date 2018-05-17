const jwt = require('jsonwebtoken');

const data = {
  id: 10
};

const token = jwt.sign(data, 'supersecret')

console.log(token)

let decoded = jwt.verify(token, 'supersecret')
console.log(decoded)