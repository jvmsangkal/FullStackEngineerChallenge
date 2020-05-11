const router = require('express').Router()
const sequelize = require('../../config/sequelize')
const { isAdmin, isLoggedIn } = require('../../middlewares/auth')
const validate = require('../../lib/validate')

const PerformanceReviews = sequelize.model('performance_reviews')
const ReviewCategories = sequelize.model('review_categories')
const { Categories } = require('../../models/performance_reviews')

router.post('/', isAdmin, async (req, res, next) => {
  const { valid, error } = validate(
    {
      properties: {
        performanceReview: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            categories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  description: { type: 'string' },
                },
                required: ['description'],
              },
            },
          },
          required: ['name', 'categories'],
        },
      },
      required: ['performanceReview'],
    },
    req.body
  )

  if (!valid) {
    return res.status(400).json(error)
  }

  const { performanceReview } = req.body

  try {
    const data = await PerformanceReviews.create(performanceReview, {
      include: [
        {
          association: Categories,
          as: 'categories',
        },
      ],
    })

    res.send({
      performanceReview: data.toJSON(),
    })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', isLoggedIn, async (req, res, next) => {
  const { id } = req.params

  try {
    const performanceReview = await PerformanceReviews.findByPk(id, {
      include: [
        {
          association: Categories,
          as: 'categories',
        },
      ],
    })

    if (!performanceReview) {
      return res
        .status(404)
        .json({ errors: { message: 'Performance Review not found' } })
    }

    res.json({
      performanceReview: performanceReview.toJSON(),
    })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', isAdmin, async (req, res, next) => {
  const { id } = req.params

  try {
    const performanceReview = await PerformanceReviews.findByPk(id, {
      include: [
        {
          association: Categories,
          as: 'categories',
        },
      ],
    })

    if (!performanceReview) {
      return res
        .status(404)
        .json({ errors: { message: 'Performance Review not found' } })
    }

    await sequelize.transaction(async (t) => {
      await Promise.all(
        performanceReview.categories.map((category) =>
          category.destroy({ transaction: t })
        )
      )
      await performanceReview.destroy({ transaction: t })
    })

    res.json({
      performanceReview: 'Successfully deleted',
    })
  } catch (err) {
    next(err)
  }
})

router.put('/:id', isAdmin, async (req, res, next) => {
  const { valid, error } = validate(
    {
      properties: {
        performanceReview: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            categories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  description: { type: 'string' },
                },
                required: ['description'],
              },
            },
          },
          required: ['name', 'categories'],
        },
      },
      required: ['performanceReview'],
    },
    req.body
  )

  if (!valid) {
    return res.status(400).json(error)
  }

  const { performanceReview: newPerformanceReview } = req.body
  const { id } = req.params

  try {
    const performanceReview = await PerformanceReviews.findByPk(id, {
      include: [
        {
          association: Categories,
          as: 'categories',
        },
      ],
    })

    if (!performanceReview) {
      return res
        .status(404)
        .json({ errors: { message: 'Performance Review not found' } })
    }

    await sequelize.transaction(async (t) => {
      await Promise.all(
        performanceReview.categories.map((category) =>
          category.destroy({ transaction: t })
        )
      )

      const categories = await Promise.all(
        newPerformanceReview.categories.map((c) =>
          ReviewCategories.create(
            {
              ...c,
              performanceReviewId: performanceReview.id,
            },
            { transaction: t }
          )
        )
      )

      await performanceReview.setCategories(categories, { transaction: t })
      await performanceReview.update(
        {
          name: newPerformanceReview.name,
        },
        {
          transaction: t,
        }
      )
    })

    res.json({
      performanceReview: performanceReview.toJSON(),
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

  const { limit, offset, all } = req.query

  if (!valid) {
    return res.status(400).json(error)
  }

  try {
    const performanceReviews = await PerformanceReviews.findAll(
      all
        ? {}
        : {
            limit,
            offset,
            include: [
              {
                association: Categories,
                as: 'categories',
              },
            ],
          }
    )

    const total = await PerformanceReviews.count()

    res.json({
      performanceReviews: performanceReviews.map((p) => p.toJSON()),
      total,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
