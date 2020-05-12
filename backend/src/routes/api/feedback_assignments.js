const sequelize = require('../../config/sequelize')
const validate = require('../../lib/validate')
const router = require('express').Router()
const { isAdmin } = require('../../middlewares/auth')

const Users = sequelize.model('users')
const PerformanceReviews = sequelize.model('performance_reviews')
const FeedbackAssignments = sequelize.model('feedback_assignments')

router.post('/', isAdmin, async (req, res, next) => {
  const { valid, error } = validate(
    {
      properties: {
        feedbackAssignment: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            assignedUserId: { type: 'string' },
            performanceReviewId: { type: 'number' },
          },
          required: ['userId', 'assignedUserId', 'performanceReviewId'],
        },
      },
      required: ['feedbackAssignment'],
    },
    req.body
  )

  if (!valid) {
    return res.status(400).json(error)
  }

  const { feedbackAssignment } = req.body

  try {
    let user = await Users.findByPk(feedbackAssignment.userId)

    if (!user) {
      return res.status(400).json({
        errors: {
          message: 'User not found',
        },
      })
    }

    user = await Users.findByPk(feedbackAssignment.assignedUserId)

    if (!user) {
      return res.status(400).json({
        errors: {
          message: 'Assigned user not found',
        },
      })
    }

    let performanceReview = await PerformanceReviews.findByPk(
      feedbackAssignment.performanceReviewId
    )

    if (!performanceReview) {
      return res.status(400).json({
        errors: {
          message: 'Performance Review not found',
        },
      })
    }

    const exists = await FeedbackAssignments.findOne({
      where: feedbackAssignment,
    })

    if (exists) {
      return res.status(400).json({
        errors: {
          message: 'Feedback assignment already exists',
        },
      })
    }

    const data = await FeedbackAssignments.create(feedbackAssignment)

    return res.json({ feedbackAssignment: data.toJSON() })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', isAdmin, async (req, res, next) => {
  const { id } = req.params

  try {
    const feedbackAssignment = await FeedbackAssignments.findByPk(id)

    if (!feedbackAssignment) {
      return res
        .status(404)
        .json({ errors: { message: 'Feedback Assignment not found' } })
    }

    await feedbackAssignment.destroy()

    res.status(200).json({
      feedbackAssignment: 'Successfully deleted',
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
