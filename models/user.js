const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: [true, "please add a username"], maxLength: 100 },
    password: { type: String, required: [true, "please add a password"], maxLength: 100 },
    email: { type: String, required: [true, "please add an email"], unique: true, maxLength: 100 },
    first_name: { type: String, maxLength: 100 },
    family_name: { type: String, maxLength: 100 },
    leagues: [],
}, {
  timestamps: true,
});

// Virtual for author's full name
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

// Virtual for user's URL
// UserSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object 
//   return `/user/${this._id}`;
// });

// Export model
module.exports = mongoose.model("User", UserSchema);