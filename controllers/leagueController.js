const League = require("../models/league");
// const Team = require("../models/team");
// const Player = require("../models/player");
// const PlayerInstance = require("../models/playerinstance");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const { populatePlayers, populateTeams } = require("../middleware/leagueMiddleware");




// @desc Return league Data by ID
// @route POST /league:id
// @access Private
exports.league_read_get = asyncHandler(async(req, res) => {
    //read league data from db and send 
    const {leagueId} = req.body;
    const league = await League.find({_id: leagueId})

    if (req.user.leagues)
    res.send("NOT IMPLEMENTED: League read data, GET");
});

// @desc Create a new league
// @route POST /league/create
// @access Private
exports.league_create_post = asyncHandler(async(req, res) => {
    //protected route so can use req.user for user data
    //get data from body
    const {name, settings, activity, year, draft} = req.body;
    //populate any additional data (teams, freeAgent players)
    const players = await populatePlayers();
    const teamsAll = await populateTeams(settings.teamCount, settings.rosterSize,req.user);
    // const leagueSettings = {
    //     schedule: settings.schedule,
    //     teamCount: settings.teamCount,
    //     missCutScore: settings.missCutScore,
    //     rosterCut: settings.rosterCut,
    //     rosterSize: settings.rosterSize
    // }
    //create new League Modal object with body data

    const league = await League.create({
        name: name,
        // admin: { type: String, required: true }, 
        admin: req.user._id,
        settings: settings,
        managers: [req.user._id], //array of user models
        teams: teamsAll, //array of team models
        activity: activity,
        freeAgents: players,
        year: year,
        draft: draft
    })
    console.log(league._id);
    //add league id data to user
    const user = await User.findById(req.user._id);
    const currentLeagues = user.leagues;
    currentLeagues.push({
        id:league._id,
        name: league.name}
    );

    try {
        const updatedUser = await User.findByIdAndUpdate(req.user._id, {leagues: currentLeagues});
        res.json({ 
            createStatus: true,
        })
        res.status(200);
    } catch (err) {
        res.json({ 
            createStatus: false,
        })
        res.status(400);
    }
});

// Handle league data update on POST.
exports.league_update_post = (req, res) => {
    res.send("NOT IMPLEMENTED: League update data, POST");
};

// Handle League data delete on POST.
exports.league_delete_post = (req, res) => {
    res.send("NOT IMPLEMENTED: Genre delete POST");
};