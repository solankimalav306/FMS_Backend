const { DataTypes } = require('sequelize');
const sequelize = require('../config/supabaseClient'); // Adjust the path as needed

const FmsAdmin = sequelize.define('FmsAdmin', {
    Admin_ID: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING(32),
        allowNull: false
    }
}, {
    tableName: 'Fms_Admin',
    timestamps: false // Set to true if you want createdAt and updatedAt columns
});

module.exports = FmsAdmin;
