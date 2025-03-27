const { DataTypes } = require('sequelize');
const sequelize = require('../config/supabaseClient'); // Adjust the path as needed

const Worker = sequelize.define('Worker', {
    Worker_ID: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    Name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    Phone_no: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            isNumeric: true
        }
    },
    Assigned_role: {
        type: DataTypes.STRING(32),
        allowNull: false
    },
    Date_of_joining: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    Rating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        validate: {
            min: 0,
            max: 5
        }
    },
    WorkerPassword: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
}, {
    tableName: 'Worker',
    timestamps: false // Set to true if you want createdAt and updatedAt columns
});

module.exports = Worker;
