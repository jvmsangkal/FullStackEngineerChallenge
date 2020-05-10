const express = require('express')
const router = express.Router()

router.use('/auth', require('./auth'))
router.use('/users', require('./users'))
router.use('/performance_reviews', require('./performance_reviews'))

module.exports = router
