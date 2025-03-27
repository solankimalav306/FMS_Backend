const { DataTypes } = require('sequelize');
const sequelize = require('../config/supabaseClient'); // Adjust the path as needed
const Service = require('./Service'); // Import Service model
const FmsAdmin = require('./FmsAdmin'); // Import FmsAdmin model
const Worker = require('./Worker'); // Import Worker model

const Assign = sequelize.define('Assign', {
    Service_ID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: Service,
            key: 'Service_ID'
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
    Worker_ID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: Worker,
            key: 'Worker_ID'
        }
    },
    Assigned_Time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    Assigned_Location: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
}, {
    tableName: 'Assigns',
    timestamps: false
});

// Define associations
Assign.belongsTo(Service, { foreignKey: 'Service_ID' });
Assign.belongsTo(FmsAdmin, { foreignKey: 'Admin_ID' });
Assign.belongsTo(Worker, { foreignKey: 'Worker_ID' });

module.exports = Assign;
