const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


// const data = {
//   id: 10
// };

// const token = jwt.sign(data, 'supersecret')

// console.log(token)

// let decoded = jwt.verify(token, 'supersecret')
// console.log(decoded)

let password = '123abc!';

bcrypt.genSalt(10, (err, salt)=>{
  bcrypt.hash(password, salt, (err, hash)=>{
    console.log(hash)
  })
});

bcrypt.compare(password,
  "$2a$10$OMrX3UaUChN0kgzyZiRjGuprfjrGsLB8bEjWtpGFGMAuSco2ca",
  (err, res)=>{
    console.log(res);
});