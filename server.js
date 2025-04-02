const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const db = require('./src/models');
const app = express();
app.use(express.json());
app.use(cors());

// Import routes
// app.use('/clients', require('./routes/clientRoutes'));
// app.use('/products', require('./routes/productRoutes'));
// app.use('/orders', require('./routes/orderRoutes'));

// Sync the models
async function syncDatabase() {
    try {
      await db.sequelize.sync({ force: false }); // Avoid using force in production
      console.log('Database synced');
    } catch (error) {
      console.error('Error syncing database:', error);
    }
  }

syncDatabase()

// Sync DB and start server
app.listen(3000, () => console.log("Server running on port 3000"));
// db.sequelize.sync({ alter: true }).then(() => {
//   console.log("Database synced!");
//   app.listen(3000, () => console.log("Server running on port 3000"));
// }).catch(err => console.error("Database sync error:", err));
