const { DataTypes } = require('sequelize');
const sequelize = require('../config/supabaseClient'); // Adjust the path as needed
const Complaint = require('./Complaint'); // Import Complaint model
const User = require('./User'); // Import User model
const FmsAdmin = require('./FmsAdmin'); // Import FmsAdmin model

const File = sequelize.define('File', {
    Complaint_ID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        references: {
            model: Complaint,
            key: 'Complaint_ID'
        }
    },
    User_ID: {
        type: DataTypes.STRING(12),
        allowNull: false,
        references: {
            model: User,
            key: 'User_ID'
        }
    },
    Admin_ID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: FmsAdmin,
            key: 'Admin_ID'
        }
    },
    is_resolved: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    tableName: 'Files',
    timestamps: false
});

// Define associations
File.belongsTo(Complaint, { foreignKey: 'Complaint_ID' });
File.belongsTo(User, { foreignKey: 'User_ID' });
File.belongsTo(FmsAdmin, { foreignKey: 'Admin_ID' });

module.exports = File;
