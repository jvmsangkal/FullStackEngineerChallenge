const Sequelize = require('sequelize')

const sequelize = require('../config/sequelize')
const { Model, DataTypes } = Sequelize

class PerformanceReviews extends Model {}

PerformanceReviews.init(
  {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'name',
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
    modelName: 'performance_reviews',
    tableName: 'performance_reviews',
  }
)

module.exports = PerformanceReviews
