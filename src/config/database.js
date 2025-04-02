const { Sequelize } = require('sequelize');
const config = require('config'); // Load the config file
const environment = 'development'; // Default to 'development'
const dbConfig = config[environment]; // Select the config for the current environment

// Initialize Sequelize with the selected environment configuration
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
});

module.exports = sequelize;