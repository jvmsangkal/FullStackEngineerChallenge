require('dotenv').config()

const express = require('express')

// Middlewares
const helmet = require('helmet')
const cors = require('cors')
const bodyParser = require('body-parser')
const session = require('express-session')

const app = express()

const isProd = process.env.NODE_ENV === 'production'

app.set('env', process.env.NODE_ENV)
app.set('trust proxy', process.env.PROXIES) // trust first proxy

app.use(helmet())
app.use(cors())
app.use(require('morgan')('dev'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: {
      secure: isProd,
      maxAge: 60000,
    },
    resave: false,
    saveUninitialized: false,
  })
)

// models & configs
require('./models/users')
require('./models/performance_reviews')
require('./models/review_categories')
require('./models/feedback_assignments')
require('./models/feedbacks')
require('./models/feedback_answers')
require('./config/passport')

app.use(require('./routes'))

app.use((req, res) => {
  res.status(404).json({ message: "Sorry can't find that!" })
})

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.json({
    errors: {
      message: err.message,
      error: isProd ? {} : err.stack,
    },
  })
})

module.exports = app
