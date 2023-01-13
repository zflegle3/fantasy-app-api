const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TeamSchema = new Schema({
  name: { type: String, required: true },
  manager: { type: String, required: true },
  //change manger to user schema 
  roster: [],
});

// Virtual for book's URL
// TeamSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
//   return `/catalog/book/${this._id}`;
// });

// Export model
module.exports = mongoose.model("Team", TeamSchema);