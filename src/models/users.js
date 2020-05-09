const Sequelize = require('sequelize')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const sequelize = require('../config/sequelize')
const roles = require('../config/roles')

const { Model, DataTypes } = Sequelize

class Users extends Model {
  setPasswordHash(password) {
    this.salt = crypto.randomBytes(16).toString('hex')
    this.passwordHash = crypto
      .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
      .toString('hex')
  }

  validatePassword(password) {
    const passwordHash = crypto
      .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
      .toString('hex')
    return this.passwordHash === passwordHash
  }

  generateJWT() {
    const today = new Date()
    const expirationDate = new Date(today)
    expirationDate.setDate(today.getDate() + 60)

    return jwt.sign(
      {
        email: this.email,
        sub: this.id,
        exp: parseInt(expirationDate.getTime() / 1000, 10),
      },
      process.env.JWT_SECRET
    )
  }

  toAuthJSON() {
    return {
      id: this.id,
      email: this.email,
      token: this.generateJWT(),
    }
  }
}

Users.init(
  {
    id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
      field: 'id',
    },
    firstName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'first_name',
    },
    lastName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'last_name',
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
      field: 'email',
    },
    salt: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'salt',
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash',
    },
    role: {
      type: DataTypes.ENUM(roles.ADMIN, roles.EMPLOYEE),
      allowNull: false,
      field: 'role',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    freezeTableName: true,
    modelName: 'users',
    tableName: 'users',
  }
)

module.exports = Users
