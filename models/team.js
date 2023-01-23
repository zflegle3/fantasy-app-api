const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TeamSchema = new Schema({
  name: { type: String, required: true },
  // manager: { type: String,},
  manager: { type: Schema.Types.ObjectId, ref: "User" },
  //not required b/c empty at first
  roster: [],
});

// Export model
module.exports = mongoose.model("Team", TeamSchema);