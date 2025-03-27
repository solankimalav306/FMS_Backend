const { DataTypes } = require('sequelize');
const sequelize = require('../config/supabaseClient'); // Adjust the path based on your project structure

const User = sequelize.define('User', {
    User_ID: {
        type: DataTypes.STRING(12),
        primaryKey: true,
        allowNull: false
    },
    UserName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Email: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    Building: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    RoomNo: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    UserPassword: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
}, {
    tableName: 'Users',
    timestamps: false // Set to true if you have createdAt and updatedAt columns
});

module.exports = User;
