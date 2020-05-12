const Sequelize = require('sequelize')

const sequelize = require('../config/sequelize')
const { Model, DataTypes } = Sequelize

const { PerformanceReviews } = require('./performance_reviews')
const Users = require('./users')

class FeedbackAssignments extends Model {}

FeedbackAssignments.init(
  {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id',
    },
    userId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'user_id',
    },
    assignedUserId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'assigned_user_id',
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
    modelName: 'feedback_assignments',
    tableName: 'feedback_assignments',
  }
)

const AssignedPerformanceReview = FeedbackAssignments.belongsTo(
  PerformanceReviews,
  {
    foreignKey: 'performanceReviewId',
    as: 'performanceReview',
  }
)

const AssignedUser = FeedbackAssignments.belongsTo(Users, {
  foreignKey: 'assignedUserId',
  as: 'assignedUser',
})

module.exports = {
  FeedbackAssignments,
  AssignedUser,
  AssignedPerformanceReview,
}
