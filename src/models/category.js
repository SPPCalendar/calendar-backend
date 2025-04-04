'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Category extends Model {
        static associate(models) {
            // Many-to-many with Event through EventCategory
            Category.belongsToMany(models.Event, {
                through: models.EventCategory,
                foreignKey: 'category_id',
                otherKey: 'event_id',
                as: 'events',
            });

            // Many-to-one with Calendar
            Category.belongsTo(models.Calendar, {
                foreignKey: 'calendar_id',
                as: 'calendar',
            });
        }
    }

    Category.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        category_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        color: {
            type: DataTypes.STRING, // RGB code
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
        modelName: 'Category',
        tableName: 'category',
        timestamps: true,
        underscored: true,
    });

    return Category;
};
