const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.json({ message: `Welcome to ${process.env.APP_NAME}` })
})

router.use('/api', require('./api'))

module.exports = router
