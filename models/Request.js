const { DataTypes } = require('sequelize');
const sequelize = require('../config/supabaseClient'); // Adjust the path as needed
const User = require('./User'); // Import User model
const Worker = require('./Worker'); // Import Worker model
const Service = require('./Service'); // Import Service model

const Request = sequelize.define('Request', {
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
    },
    Service_ID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: Service,
            key: 'Service_ID'
        }
    },
    building: {
        type: DataTypes.STRING(32),
        allowNull: false
    },
    room_no: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    feedback: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    is_completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    request_time: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'Requests',
    timestamps: false
});

// Define associations
Request.belongsTo(User, { foreignKey: 'User_ID' });
Request.belongsTo(Worker, { foreignKey: 'Worker_ID' });
Request.belongsTo(Service, { foreignKey: 'Service_ID' });

module.exports = Request;
