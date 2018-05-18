const {User} = require('./../models/user');

const authenticate = (req, res, next) => {
  const token = req.header("x-auth");
  User.findByToken(token)
    .then(user => {
      if (!user) {
        return Promise.reject();
      }
      console.log(user);
      req.user = user;
      req.token = token;
      next();
    })
    .catch(e => {
      res.status(401).send({ error: "Authentication Required" });
    });
};

module.exports = {authenticate};