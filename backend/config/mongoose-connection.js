require('dotenv').config(); // load .env variables
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Database Connection Done!"))
.catch((err) => console.error("MongoDB connection error:", err));

module.exports = mongoose.connection;
