'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Event extends Model {
        static associate(models) {
            Event.belongsTo(models.Calendar, {
                foreignKey: 'calendar_id',
                as: 'calendar',
            });

            Event.belongsToMany(models.Category, {
                through: models.EventCategory,
                foreignKey: 'event_id',
                otherKey: 'category_id',
                as: 'categories',
            });
        }
    }

    Event.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        event_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        start_time: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        end_time: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        color: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        calendar_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'calendar',
                key: 'id',
            },
        },
    }, {
        sequelize,
        modelName: 'Event',
        tableName: 'event',
        timestamps: true,
        underscored: true,
    });

    return Event;
};
