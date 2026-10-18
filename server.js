require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db_Connect");
 
const app = express();
 
app.use(cors());
app.use(express.json());
 
// les images envoyées par la vendeuse sont servies depuis /uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
 
connectDB();
 
app.use("/user", require("./routes/user"));
app.use("/admin", require("./routes/admin"));
app.use("/product", require("./routes/product"));
app.use("/cart", require("./routes/cart"));
app.use("/order", require("./routes/order"));
app.use("/upload", require("./routes/upload"));
 
const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
  if (err) return console.error(err);
  console.log(`Server running on port ${PORT}`);
});