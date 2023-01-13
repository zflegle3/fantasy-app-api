const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SettingsSchema = new Schema({
  schedule: { type : Array , "default" : [] },
  teamCount: { type : Number},
  missCutScore: { type : Number},
  rosterCut: { type : Number},
  rosterSize: { type : Number},
});

const LeagueSchema = new Schema({
  name: { type: String, required: true },
  admin: { type: String, required: true }, 
  //change admin to user schema 
  // settings: {
  //   type: Map,
  //   of: new Schema({
  //       schedule: { type : Array , "default" : [] },
  //       teamCount: { type : Number},
  //       missCutScore: { type : Number},
  //       rosterCut: { type : Number},
  //       rosterSize: { type : Number},
  //   })
  // },
  settings: {type: SettingsSchema, required: true},
  teams: [{ type: Schema.Types.ObjectId, ref: "Team" }],
  activity: { type : Array , "default" : [] },
});

// Virtual for bookinstance's URL
LeagueSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/league/${this._id}`;
});

// Export model
module.exports = mongoose.model("League", LeagueSchema);