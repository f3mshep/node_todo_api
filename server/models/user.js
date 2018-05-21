const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcryptjs = require('bcryptjs');

AUTH = 'auth'
SALT = process.env.JWT_SECRET;

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

UserSchema.methods.removeToken = function (token) {
  const user = this;

  return user.update({
    $pull:{
      tokens: {
        token: token
      }
    }
  });
};

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

UserSchema.statics.findByCredentials = function(email, password){
  const User = this;
  return User.findOne({ email }).then((user)=>{
    if (!user) return Promise.reject()
    return new Promise((resolve, reject) => {
      bcryptjs.compare(password, user.password, (err, isMatch) => {
        if (isMatch) {
          return resolve(user)
        } else {
          return reject()
        };
      });
    });
  });

}

UserSchema.pre('save', function (next){
  const user = this;

  if (user.isModified('password')){
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