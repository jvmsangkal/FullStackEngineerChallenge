const passport = require('passport')
const roles = require('../config/roles')

exports.isEmployee = (req, res, next) => {
  return passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      return next(err)
    }

    if (user && user.role === roles.EMPLOYEE) {
      req.user = user
      return next()
    }

    return res.status(401).json({
      errors: {
        message: 'Authentication failed!',
      },
    })
  })(req, res, next)
}

exports.isAdmin = (req, res, next) => {
  return passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      return next(err)
    }

    if (user && user.role === roles.ADMIN) {
      req.user = user
      return next()
    }

    return res.status(401).json({
      errors: {
        message: 'Authentication failed!',
      },
    })
  })(req, res, next)
}

exports.isLoggedIn = (req, res, next) => {
  return passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      return next(err)
    }

    if (user) {
      req.user = user
      return next()
    }

    return res.status(401).json({
      errors: {
        message: 'Authentication failed!',
      },
    })
  })(req, res, next)
}
