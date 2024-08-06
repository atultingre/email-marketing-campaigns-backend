const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/user");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://email-marketing:email-marketing@cluster0.uu2vcnf.mongodb.net/email-marketing"
);

// Use routes
app.use(userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port http://192.168.0.106:${PORT}`);
});
