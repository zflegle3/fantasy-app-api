const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// const SettingsSchema = new Schema({
//   schedule: { type : Array , "default" : [] },
//   teamCount: { type : Number},
//   missCutScore: { type : Number}, or string of "avg"
//   rosterCut: { type : Number},
//   rosterSize: { type : Number},
// });

const LeagueSchema = new Schema({
  name: { type: String, required: true },
  admin: { type: Schema.Types.ObjectId, ref: "User" },
  settings: {type: Schema.Types.Mixed, required: true}, 
  managers: [], //array of user ids
  teams: [], //array of team models
  activity: { type : Array , "default" : [] },
  freeAgents: { type : Array , "default" : [] },
  year:{ type : Number , "default" : 2023 },
  draft: {type: Map, required: true}, 
  chat: { type: String, required: true },
  passcode: { type: String,},
},{
  timestamps: true,
});

// Export model
module.exports = mongoose.model("League", LeagueSchema);
// module.exports = mongoose.model("Settings", SettingsSchema);