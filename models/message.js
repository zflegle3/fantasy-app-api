const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    timestamp: { type: Date, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    league: { type: Schema.Types.ObjectId, ref: "League", required: true },
});

// Virtual for bookinstance's URL
// BookInstanceSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
//   return `/catalog/bookinstance/${this._id}`;
// });

// Export model
module.exports = mongoose.model("Message", MessageSchema);