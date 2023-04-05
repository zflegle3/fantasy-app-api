const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TeamSchema = new Schema({
  name: { type: String, required: true },
  // manager: { type: String,},
  manager: { type: String},
  //not required b/c empty at first
  roster: [],
});

// Export model
module.exports = mongoose.model("Team", TeamSchema);