const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://bharath:bharath@cluster0.mcnlrgp.mongodb.net/?appName=Cluster0"

// Establish connection to MongoDB cluster
const atlasConnection = mongoose.createConnection(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = { atlasConnection, MONGO_URI };
