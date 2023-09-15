let express = require("express");
let app = express();
let bodyParser = require("body-parser");
let mongoose = require("mongoose");
let UserRoutes = require("./Authentication/Auth");
let BlogRoutes= require("./Blogs/blogs")
let cors=require('cors')
require('dotenv').config()
   mongoose
  .connect(
   process.env.DATABASE_CONNECTION_STRING,
    { dbName: "MidiumLite" }
  )
  .then(() => {
    console.log("Connected to Database");
  })
  .catch((err) => {
    console.log("Failed to connect to Databse", err.message);
  });
app.use(cors())
app.use(bodyParser.json());
app.use("/user", UserRoutes);
app.use("/blog", BlogRoutes);
app.use(express.static('public'))
app.get("/", (req, res) => {
  res.json({ message: "welcome to Midium Lite" });
});

app.listen(process.env.PORT, () => {
  console.log("App is Running");
});
