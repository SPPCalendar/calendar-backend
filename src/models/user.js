'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            // Define associations here
            // Example: User.hasMany(models.Post, { foreignKey: 'userId' });
        }
    }

    User.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true, // Automatically increments with each new record
        },
        display_name: {
            type: DataTypes.STRING,
            allowNull: false, // The display_name cannot be null
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true, // Ensures the username is unique in the database
            validate: {
                notEmpty: true, // Ensures the username is not empty
            },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true, // Ensures the email is unique
            validate: {
                isEmail: true, // Validates the email format
            },
        },
        email_confirmed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false, // Default value is false if not provided
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false, // Password hash cannot be null
        },
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'user', // Table name in the database
        timestamps: true,  // Automatically adds createdAt and updatedAt fields
        underscored: true, // Uses snake_case for column names (optional)
    });

    return User;
}