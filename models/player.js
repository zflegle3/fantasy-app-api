const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PlayerSchema = new Schema({
    first_name: { type: String, required: true, maxLength: 100 },
    family_name: { type: String, required: true, maxLength: 100 },
});

// Virtual for player's full name
UserSchema.virtual("fullName").get(function () {
  // To avoid errors in cases where an author does not have either a family name or first name
  // We want to make sure we handle the exception by returning an empty string for that case
  let fullname = "";
  if (this.first_name && this.family_name) {
    fullname = `${this.family_name}, ${this.first_name}`;
  }
  if (!this.first_name || !this.family_name) {
    fullname = "";
  }
  return fullname;
});

// Virtual for player's URL
// UserSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
//   return `/user/${this._id}`;
// });

// Export model
module.exports = mongoose.model("Player", PlayerSchema);