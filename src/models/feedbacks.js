const Sequelize = require('sequelize')

const sequelize = require('../config/sequelize')
const { Model, DataTypes } = Sequelize

const { FeedbackAnswers } = require('./feedback_answers')
const { PerformanceReviews } = require('./performance_reviews')
const Users = require('./users')

class Feedbacks extends Model {}

Feedbacks.init(
  {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id',
    },
    submittedByUserId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'submitted_by_user_id',
    },
    feedbackForUserId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'feedback_for_user_id',
    },
    performanceReviewId: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      field: 'performance_review_id',
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
    modelName: 'feedbacks',
    tableName: 'feedbacks',
  }
)

const Answers = Feedbacks.hasMany(FeedbackAnswers, {
  foreignKey: 'feedbackId',
  as: 'answers',
})

const SubmittedByUser = Feedbacks.belongsTo(Users, {
  foreignKey: 'submittedByUserId',
  as: 'submittedByUser',
})

const FeedbackPerformanceReview = Feedbacks.belongsTo(PerformanceReviews, {
  foreignKey: 'performanceReviewId',
  as: 'performanceReview',
})

module.exports = {
  Feedbacks,
  Answers,
  SubmittedByUser,
  FeedbackPerformanceReview,
}
