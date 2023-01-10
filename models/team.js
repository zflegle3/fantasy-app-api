const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TeamSchema = new Schema({
  name: { type: String, required: true },
  manager: { type: Schema.Types.ObjectId, ref: "User", required: true },
  roster: [{ type: Schema.Types.ObjectId, ref: "Player" }],
});

// Virtual for book's URL
// TeamSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
//   return `/catalog/book/${this._id}`;
// });

// Export model
module.exports = mongoose.model("Team", TeamSchema);