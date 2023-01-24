const League = require("../models/league");
// const Team = require("../models/team");
// const Player = require("../models/player");
// const PlayerInstance = require("../models/playerinstance");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const { populatePlayers, populateTeams } = require("../middleware/leagueMiddleware");


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
    try {
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
        res.json(league)
        res.status(200);
    } catch (err) {
        res.json({error: err})
        res.status(400);
    }
});

// @desc Return leagues by user 
// @route GET league/getAll
// @access Private
exports.league_read_getAll = asyncHandler(async(req, res) => {
    // find leagues where user is a manager
    const leaguesAll = await League.find({managers: req.user._id})
    let leaguesResponse = [];
    for (let i=0; i< leaguesAll.length; i++) {
        leaguesResponse.push({
            id: leaguesAll[i]._id,
            name: leaguesAll[i].name
        })
    }
    res.send(leaguesResponse);
    res.status(200);
});


// @desc Return league Data by ID
// @route POST league/getOne
// @access Private
exports.league_read_getOne = asyncHandler(async(req, res) => {
    //read league data from db and send 
    const {_id} = req.body;
    const league = await League.findOne({_id: _id})
    // let managerlist = league.managers;
    if (league.managers.includes(req.user._id)) {
        res.send(league);
        res.status(200);
    } else {
        res.json({error: "Invalid user credentials, user is not a member of the selected league"});
        res.status(400);
    }

    // res.send(league);
});

// Handle league data update on POST.
exports.league_update_post = (req, res) => {
    res.send("NOT IMPLEMENTED: League update data, POST");
};

// Handle League data delete on POST.
exports.league_delete_post = (req, res) => {
    res.send("NOT IMPLEMENTED: Genre delete POST");
};