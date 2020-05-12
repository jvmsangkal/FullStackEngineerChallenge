const router = require('express').Router()
const passport = require('passport')

router.post('/login', (req, res, next) => {
  return passport.authenticate(
    'local',
    { session: false },
    (err, passportUser, info) => {
      if (err) {
        return next(err)
      }

      if (passportUser) {
        return res.json({ user: passportUser })
      }

      return res.status(400).json(info)
    }
  )(req, res, next)
})

module.exports = router
