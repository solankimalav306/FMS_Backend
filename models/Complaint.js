const { DataTypes } = require('sequelize');
const sequelize = require('../config/supabaseClient'); // Adjust the path as needed

const Complaint = sequelize.define('Complaint', {
    Complaint_ID: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    Complaint: {
        type: DataTypes.STRING(255),
        allowNull: true // Adjust as needed
    },
    Complaint_dateTime: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'Complaints',
    timestamps: false // Set to true if you want createdAt and updatedAt columns
});

module.exports = Complaint;
