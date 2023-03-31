const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    refId: { type: String, required: true, },
    name: { type: String, required: [true, "please add a username"], maxLength: 100 },
    members: [],
    messages: [],
}, {
  timestamps: true,
});

// Export model
module.exports = mongoose.model("Chat", ChatSchema);