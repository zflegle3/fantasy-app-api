const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PlayerInstance = new Schema({
  player: { type: Schema.Types.ObjectId, ref: "Player" },
  status: {
    type: String, 
    required: true,
    enum: ["available", "rostered",],
    default: "available",
  },
  scores: {
    rd1: 0,
    rd2: 0,
    rd3: 0,
    rd4: 0
  }
});

// Export model
module.exports = mongoose.model("PlayerInstance", PlayerInstance);