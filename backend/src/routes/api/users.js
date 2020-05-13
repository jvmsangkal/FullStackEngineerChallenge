const { v4: uuidv4 } = require('uuid')

const router = require('express').Router()
const { isLoggedIn, isAdmin, isEmployee } = require('../../middlewares/auth')
const validate = require('../../lib/validate')
const roles = require('../../config/roles')
const sequelize = require('../../config/sequelize')
const Op = require('sequelize').Op
const Users = sequelize.model('users')
const FeedbackAssignments = sequelize.model('feedback_assignments')
const Feedbacks = sequelize.model('feedbacks')
const {
  AssignedUser,
  AssignedPerformanceReview,
} = require('../../models/feedback_assignments')
const {
  Answers,
  SubmittedByUser,
  FeedbackPerformanceReview,
} = require('../../models/feedbacks')

const { AnswerCategory } = require('../../models/feedback_answers')

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

router.get('/me/reviewees', isEmployee, async (req, res, next) => {
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
      feedbackAssignments: data.map((d) => ({
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

    await sequelize.transaction(async (t) => {
      await user.destroy({ transaction: t })
      await FeedbackAssignments.destroy(
        {
          where: {
            [Op.or]: [{ userId: id }, { assignedUserId: id }],
          },
        },
        { transaction: t }
      )
    })
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
    const existingUser = await Users.findByPk(id)

    if (!existingUser) {
      return res.status(404).json({ errors: { message: 'User not found' } })
    }

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
      feedbackAssignments: data.map((d) => ({
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

router.post('/:id/feedbacks', isEmployee, async (req, res, next) => {
  const { valid, error } = validate(
    {
      properties: {
        feedback: {
          type: 'object',
          properties: {
            performanceReviewId: { type: 'number' },
            answers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  reviewCategoryId: { type: 'number' },
                  rating: { type: 'number' },
                  explanation: { type: 'string' },
                },
                required: ['reviewCategoryId', 'rating', 'explanation'],
              },
            },
          },
          required: ['performanceReviewId', 'answers'],
        },
      },
      required: ['feedback'],
    },
    req.body
  )

  if (!valid) {
    return res.status(400).json(error)
  }

  const { feedback } = req.body
  feedback.submittedByUserId = req.user.id
  feedback.feedbackForUserId = req.params.id

  try {
    const assignmentExists = await FeedbackAssignments.findOne({
      where: {
        userId: feedback.submittedByUserId,
        assignedUserId: feedback.feedbackForUserId,
        performanceReviewId: feedback.performanceReviewId,
      },
    })

    if (!assignmentExists) {
      return res.status(400).json({
        errors: { message: 'Feedback assignment does not exist' },
      })
    }

    const data = await Feedbacks.create(feedback, {
      include: [
        {
          association: Answers,
          as: 'answers',
        },
      ],
    })

    res.send({
      feedback: data.toJSON(),
    })
  } catch (err) {
    next(err)
  }
})

router.get('/:id/feedbacks', isAdmin, async (req, res, next) => {
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
  const feedbackForUserId = req.params.id

  try {
    const where = { feedbackForUserId }
    const data = await Feedbacks.findAll({
      where,
      ...(all
        ? {}
        : {
            limit,
            offset,
          }),
      include: [
        {
          association: SubmittedByUser,
          as: 'submittedByUser',
        },
        {
          association: FeedbackPerformanceReview,
          as: 'performanceReview',
        },
        {
          association: Answers,
          as: 'answers',
          include: [
            {
              association: AnswerCategory,
              as: 'category',
            },
          ],
        },
      ],
    })

    const total = await Feedbacks.count({ where })

    res.send({
      feedbacks: data.map((d) => ({
        ...d.dataValues,
        submittedByUser: d.submittedByUser && d.submittedByUser.toJSON(),
        performanceReview: d.performanceReview.dataValues,
        answers: d.answers.map((a) => ({
          ...a.dataValues,
          category: a.category.dataValues,
        })),
      })),
      total,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
