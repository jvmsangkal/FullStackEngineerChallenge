const Sequelize = require('sequelize')

const sequelize = require('../config/sequelize')
const { Model, DataTypes } = Sequelize

class ReviewCategories extends Model {}

ReviewCategories.init(
  {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id',
    },
    performanceReviewId: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      field: 'performance_review_id',
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'description',
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
    modelName: 'review_categories',
    tableName: 'review_categories',
  }
)

module.exports = ReviewCategories
