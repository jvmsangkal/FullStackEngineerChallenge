const { v4: uuidv4 } = require('uuid')

const router = require('express').Router()
const { isLoggedIn, isAdmin } = require('../../middlewares/auth')
const validate = require('../../lib/validate')
const roles = require('../../config/roles')
const sequelize = require('../../config/sequelize')

const Users = sequelize.model('users')

router.post('/', isAdmin, async (req, res, next) => {
  const { valid, error } = validate(
    {
      properties: {
        user: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { format: 'email' },
            password: { type: 'string' },
            role: { enum: [roles.ADMIN, roles.EMPLOYEE] },
          },
          required: ['firstName', 'lastName', 'email', 'password', 'role'],
        },
      },
      required: ['user'],
    },
    req.body
  )

  if (!valid) {
    return res.status(400).json(error)
  }
  const { user } = req.body
  try {
    const existingUser = await Users.findOne({ where: { email: user.email } })

    if (existingUser) {
      res.status(400).send({ errors: { message: 'Email already exists' } })
    }

    const newUser = Users.build({
      id: uuidv4(),
      ...user,
    })
    newUser.setPasswordHash(user.password)

    await newUser.save()
    return res.json({ user: newUser.toAuthJSON() })
  } catch (err) {
    next(err)
  }
})

router.get('/me', isLoggedIn, (req, res) => {
  return res.json({ user: req.user })
})

module.exports = router
