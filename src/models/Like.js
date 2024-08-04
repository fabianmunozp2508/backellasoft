const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db_postgres');
const User = require('./User');
const Post = require('./Post');

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Post',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

Like.belongsTo(User, { foreignKey: 'user_id' });
Like.belongsTo(Post, { foreignKey: 'post_id' });

module.exports = Like;
