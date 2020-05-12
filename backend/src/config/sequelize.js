const Sequelize = require('sequelize')

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
    define: {
      timestamps: false,
    },
    logging: false,
  }
)

module.exports = sequelize
