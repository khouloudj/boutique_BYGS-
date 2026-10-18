require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

(async () => {
  // beddel el esm ken el variable fil .env mte3ek mkhtalef (MONGO_URI / MONGODB_URI / DB_URI...)
  await mongoose.connect(process.env.MONGO_URI);

  const r = await Product.updateMany(
    { isActive: { $exists: false } },
    { $set: { isActive: true } }
  );
  console.log("Updated:", r.modifiedCount);

  await mongoose.disconnect();
})();
