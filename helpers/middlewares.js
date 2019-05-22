const createError = require('http-errors');

exports.isLoggedIn = role => (req, res, next) => {
  // if (req.session.currentUser && ((req.session.currentUser.role == role) || (req.session.currentUser.role == 'admin'))) {
  //   next();
  // } else {
  //   next(createError(401, 'User not logged'));
  // }
  next();
};

exports.isNotLoggedIn = () => (req, res, next) => {
  if (!req.session.currentUser) {
    next();
  } else {
    next(createError(403, 'User already logged'));
  }
};

exports.validationLoggin = () => (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next(createError(422, 'Empty fields not allowed'));
  } else {
    next();
  }
};

exports.validationSignup = () => (req, res, next) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    next(createError(422, 'Empty fields not allowed'));
  } else {
    next();
  }
};
