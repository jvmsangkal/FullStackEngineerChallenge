const passport = require('passport')
const LocalStrategy = require('passport-local')
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')

const sequelize = require('./sequelize')
const Users = sequelize.model('users')

passport.use(
  new LocalStrategy(
    {
      usernameField: 'user[email]',
      passwordField: 'user[password]',
    },
    async (email, password, done) => {
      try {
        const user = await Users.findOne({ where: { email } })

        if (!user || !user.validatePassword(password)) {
          return done(null, false, {
            errors: { message: 'Email or password is invalid' },
          })
        }

        return done(null, user)
      } catch (err) {
        done(err)
      }
    }
  )
)

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (jwt_payload, done) => {
      if (!jwt_payload.sub) {
        return done(null, false)
      }

      try {
        const user = await Users.findOne({ where: { id: jwt_payload.sub } })
        if (user) {
          return done(null, user)
        }

        return done(null, false)
      } catch (err) {
        done(err, false)
      }
    }
  )
)
