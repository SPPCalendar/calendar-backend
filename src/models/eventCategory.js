'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class EventCategory extends Model {
        static associate(models) {
            EventCategory.belongsTo(models.Event, {
                foreignKey: 'event_id',
                as: 'event',
            });
            EventCategory.belongsTo(models.Category, {
                foreignKey: 'category_id',
                as: 'category',
            });
        }
    }

    EventCategory.init({
        event_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'event',
                key: 'id',
            },
        },
        category_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'category',
                key: 'id',
            },
        },
    }, {
        sequelize,
        modelName: 'EventCategory',
        tableName: 'event_category',
        timestamps: false, // Unless you want createdAt/updatedAt for the join
        underscored: true,
    });

    return EventCategory;
};