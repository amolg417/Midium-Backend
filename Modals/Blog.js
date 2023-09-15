let mongoose = require("mongoose");

let BlogSchema = mongoose.Schema({
  Title: { type: String },
  Description: { type: String },
  Image: { type: String },
  CreatedAt: { type: Number },
  User: { type: mongoose.Types.ObjectId, ref: "Users" },
  Views: { type: Number },
  Category: { type: String },
  IsPicked: { type: Boolean },
});

let BlogModal = mongoose.model("Blogs", BlogSchema);
module.exports = BlogModal;
