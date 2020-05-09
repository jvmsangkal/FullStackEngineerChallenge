const Sequelize = require('sequelize')

const sequelize = require('../config/sequelize')
const { Model, DataTypes } = Sequelize

class FeedbackAnswers extends Model {}

FeedbackAnswers.init(
  {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id',
    },
    feedbackId: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      field: 'feedback_id',
    },
    reviewCategoryId: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      field: 'review_category_id',
    },
    rating: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0',
      field: 'rating',
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'explanation',
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
    modelName: 'feedback_answers',
    tableName: 'feedback_answers',
  }
)

module.exports = FeedbackAnswers
