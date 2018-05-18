const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcryptjs = require('bcryptjs');

AUTH = 'auth'
SALT = 'abc123'

const UserSchema = new mongoose.Schema({
    email: {
      type: String,
      minlength: 1,
      required: true,
      trim: true,
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: '{VALUE} is not a valid email'
      }
    },
    password: {
      type: String,
      require: true,
      minlength: 6
    },
    tokens: [{
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }]
});

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email'])
}

UserSchema.methods.generateAuthToken = function () {
  let user = this;
  let access = AUTH;
  let token = jwt.sign({_id: user._id.toHexString(), access }, SALT).toString();

  user.tokens.push({ access, token });

  return user.save().then(()=> {
    return token;
  })
};

UserSchema.statics.findByToken = function(token) {
  let User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, SALT);
  } catch (e) {
    return new Promise((resolve, reject)=>reject())
  }

  return User.findOne({
    _id: decoded._id,
    "tokens.token": token,
    "tokens.access":AUTH
  });
};

UserSchema.pre('save', function (next){
  const user = this;

  if (user.isModified('password')){
    console.log("fired hash function");
    bcryptjs.genSalt(10, (err, salt)=>{
      bcryptjs.hash(user.password, salt, (error, hash)=>{
        user.password = hash;
        next();
      });
    });
  }
  else{
    next();
  };
});

const User = mongoose.model('User', UserSchema);

module.exports = {User};