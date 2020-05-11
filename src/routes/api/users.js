const { v4: uuidv4 } = require('uuid')

const router = require('express').Router()
const { isLoggedIn, isAdmin, isEmployee } = require('../../middlewares/auth')
const validate = require('../../lib/validate')
const roles = require('../../config/roles')
const sequelize = require('../../config/sequelize')

const Users = sequelize.model('users')
const FeedbackAssignments = sequelize.model('feedback_assignments')
const {
  AssignedUser,
  AssignedPerformanceReview,
} = require('../../models/feedback_assignments')

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
      return res
        .status(400)
        .json({ errors: { message: 'Email already exists' } })
    }

    const newUser = Users.build({
      id: uuidv4(),
      ...user,
    })
    newUser.setPasswordHash(user.password)

    await newUser.save()

    return res.json({ user: newUser.toJSON() })
  } catch (err) {
    next(err)
  }
})

router.get('/me', isLoggedIn, (req, res) => {
  return res.json({ user: req.user })
})

router.get('/', isAdmin, async (req, res, next) => {
  const { valid, error } = validate(
    {
      properties: {
        limit: {
          type: 'number',
          default: 10,
        },
        offset: {
          type: 'number',
          default: 0,
        },
        all: {
          type: 'number',
          default: 0,
        },
      },
    },
    req.query,
    { coerceTypes: true }
  )

  if (!valid) {
    return res.status(400).json(error)
  }

  const { limit, offset, all } = req.query

  const where = { role: roles.EMPLOYEE }
  try {
    const users = await Users.findAll({
      where,
      ...(all
        ? {}
        : {
            limit,
            offset,
          }),
    })

    const total = await Users.count({ where })

    res.json({
      users: users.map((user) => user.toJSON()),
      total,
    })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', isAdmin, async (req, res, next) => {
  const { id } = req.params

  try {
    const user = await Users.findByPk(id)

    if (!user) {
      return res.status(404).json({ errors: { message: 'User not found' } })
    }

    res.json({
      user: user.toJSON(),
    })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', isAdmin, async (req, res, next) => {
  const { id } = req.params

  try {
    const user = await Users.findByPk(id)

    if (!user) {
      return res.status(404).json({ errors: { message: 'User not found' } })
    }

    await user.destroy()

    res.status(200).json({
      user: 'Successfully deleted',
    })
  } catch (err) {
    next(err)
  }
})

router.put('/:id', isAdmin, async (req, res, next) => {
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
  const { id } = req.params

  try {
    const existingUser = await Users.findByPk(id)

    if (!existingUser) {
      return res.status(404).json({ errors: { message: 'User not found' } })
    }

    existingUser.setPasswordHash(user.password)
    await existingUser.update({
      ...user,
      salt: existingUser.salt,
      passwordHash: existingUser.passwordHash,
    })

    return res.json({ user: existingUser.toJSON() })
  } catch (err) {
    next(err)
  }
})

router.get('/:id/feedback_assignments', isAdmin, async (req, res, next) => {
  const { valid, error } = validate(
    {
      properties: {
        limit: {
          type: 'number',
          default: 10,
        },
        offset: {
          type: 'number',
          default: 0,
        },
        all: {
          type: 'number',
          default: 0,
        },
      },
    },
    req.query,
    { coerceTypes: true }
  )

  if (!valid) {
    return res.status(400).json(error)
  }

  const { limit, offset, all } = req.query
  const { id } = req.params

  try {
    const where = { userId: id }
    const data = await FeedbackAssignments.findAll({
      where,
      ...(all
        ? {}
        : {
            limit,
            offset,
          }),
      include: [
        {
          association: AssignedPerformanceReview,
          as: 'performanceReview',
        },
        {
          association: AssignedUser,
          as: 'assignedUser',
        },
      ],
    })

    const total = await FeedbackAssignments.count({ where })

    res.json({
      FeedbackAssignments: data.map((d) => ({
        ...d.dataValues,
        assignedUser: d.assignedUser.toJSON(),
        performanceReview: d.performanceReview.dataValues,
      })),
      total,
    })
  } catch (err) {
    next(err)
  }
})

router.get('/reviewees', isEmployee, async (req, res, next) => {
  const { valid, error } = validate(
    {
      properties: {
        limit: {
          type: 'number',
          default: 10,
        },
        offset: {
          type: 'number',
          default: 0,
        },
        all: {
          type: 'number',
          default: 0,
        },
      },
    },
    req.query,
    { coerceTypes: true }
  )

  if (!valid) {
    return res.status(400).json(error)
  }

  const { limit, offset, all } = req.query
  const { id } = req.user

  try {
    const where = { userId: id }
    const data = await FeedbackAssignments.findAll({
      where,
      ...(all
        ? {}
        : {
            limit,
            offset,
          }),
      include: [
        {
          association: AssignedPerformanceReview,
          as: 'performanceReview',
        },
        {
          association: AssignedUser,
          as: 'assignedUser',
        },
      ],
    })

    const total = await FeedbackAssignments.count({ where })

    res.json({
      FeedbackAssignments: data.map((d) => ({
        ...d.dataValues,
        assignedUser: d.assignedUser.toJSON(),
        performanceReview: d.performanceReview.dataValues,
      })),
      total,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
