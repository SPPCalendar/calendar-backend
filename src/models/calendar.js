'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Calendar extends Model {
        static associate(models) {
            // Many-to-many with User through UserCalendar
            Category.belongsToMany(models.Event, {
                through: models.EventCategory,
                foreignKey: 'category_id',
                otherKey: 'event_id',
                as: 'events',
            });
            
            // One-to-many with Event
            Calendar.hasMany(models.Event, {
                foreignKey: 'calendar_id',
                as: 'events',
            });

            // One-to-many with Category
            Calendar.hasMany(models.Category, {
                foreignKey: 'calendar_id',
                as: 'categories',
            });
        }
    }

    Calendar.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        calendar_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        color: {
            type: DataTypes.STRING, // RGB code (e.g. "#FF0000")
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'Calendar',
        tableName: 'calendar',
        timestamps: true,
        underscored: true,
    });

    return Calendar;
};
