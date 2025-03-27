const { DataTypes } = require('sequelize');
const sequelize = require('../config/supabaseClient'); // Adjust the path as needed
const User = require('./User'); // Import the User model
const Worker = require('./Worker'); // Import the Worker model

const Order = sequelize.define('Order', {
    Order_ID: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    Collected: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    Location: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    User_ID: {
        type: DataTypes.STRING(12),
        allowNull: false,
        references: {
            model: User,
            key: 'User_ID'
        }
    },
    Worker_ID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: Worker,
            key: 'Worker_ID'
        }
    }
}, {
    tableName: 'Orders',
    timestamps: false // Set to true if you want createdAt and updatedAt columns
});

// Define associations
Order.belongsTo(User, { foreignKey: 'User_ID' });
Order.belongsTo(Worker, { foreignKey: 'Worker_ID' });

module.exports = Order;
