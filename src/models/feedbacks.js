const Sequelize = require('sequelize')

const sequelize = require('../config/sequelize')
const { Model, DataTypes } = Sequelize

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

module.exports = Feedbacks
