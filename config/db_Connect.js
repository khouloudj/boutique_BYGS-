const mongoose = require("mongoose");
 
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.error(`
Causes probables :
 1) Ton IP n'est pas autorisée : Atlas > Network Access > Add IP Address > "Allow access from anywhere"
 2) Pas d'internet, ou le Wi-Fi bloque MongoDB (essaie avec le partage de connexion de ton téléphone)
 3) Cluster en pause : Atlas > Database > bouton "Resume"
 4) MONGO_URI incorrect dans le fichier .env`);
    process.exit(1);
  }
};
 
module.exports = connectDB;