const { DataTypes } = require('sequelize');
const sequelize = require('../config/supabaseClient'); // Adjust the path as needed

const Service = sequelize.define('Service', {
    Service_ID: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    Service_Type: {
        type: DataTypes.STRING(30),
        allowNull: false
    }
}, {
    tableName: 'Services',
    timestamps: false // Set to true if you want createdAt and updatedAt columns
});

module.exports = Service;
