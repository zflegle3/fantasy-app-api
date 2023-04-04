const League = require("../models/league");
// const Team = require("../models/team");
// const Player = require("../models/player");
// const PlayerInstance = require("../models/playerinstance");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const { populatePlayers, populateTeams, populateChat } = require("../middleware/leagueMiddleware");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');


const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "30d"})
}

// @desc Create a new league
// @route POST /league/create
// @access Private
exports.league_create_post = asyncHandler(async(req, res) => {
    console.log("called", new Date());
    //protected route so can use req.user for user data
    //get data from body
    const {adminId, name, settings, activity, year, draft} = req.body;
    // const chatId = await populateChat();
    //Check for user
    let admin = await User.findOne({_id: adminId})
    if (!admin) {
        res.status(401)
        throw new Error("User not found");
    } 
    console.log("found user", new Date());
    //populate any additional data (teams, freeAgent players)
    const players = await populatePlayers();
    const teamsAll = await populateTeams(settings.teamCount, settings.rosterSize, adminId);
    const chatId = await populateChat(admin.username);
    //create new League Modal object with body data
    const league = await League.create({
        name: name,
        admin: adminId,
        settings: settings,
        managers: [adminId], //array of user models
        teams: teamsAll, //array of team models
        activity: activity,
        freeAgents: players,
        year: year,
        draft: draft,
        chat: chatId,
    });
    console.log("created league", new Date());
    if (!league) {
        res.status(400)
        throw new Error("Unable to create league")
    };
    //Add league to user's leagues array
    let leaguesNew = [...admin.leagues];
    if (!leaguesNew) {
        leaguesNew = [];
    };
    leaguesNew.push({
        id: league._id,
        name: league.name,
    })
    //Update user with new leagues data
    const updatedUser = await User.findByIdAndUpdate(adminId, {leagues: leaguesNew}, {new: true});
    if (!updatedUser) {
        res.status(401)
        throw new Error("Unable to update user with new league");
    } else {
        console.log("updated user", new Date());
        //returns updated admin user profile on success
        res.json({
            _id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            first_name: updatedUser.first_name,
            family_name: updatedUser.family_name,
            favorites: updatedUser.favorites,
            leagues: updatedUser.leagues,
            chats: [],
            color: updatedUser.color,
            profileImage: updatedUser.profileImage,
            token: generateToken(updatedUser._id),
        });
        res.status(200);
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
exports.league_update_settings = async (req, res) => {
    const {id, adminId, name, teamCount, rosterSize, rosterCut, missCutScore} = req.body;
    //comfirm league id
    let leagueCheck = await League.findOne({_id: id});
    if (!leagueCheck) {
        res.status(401)
        throw new Error("League not found");
    }
    //Update valid fields
    let update = {settings: {
        schedule: [],
        proLeague: "pga"
    }};
    update.name = name;
    update.settings.teamCount = teamCount;
    update.settings.rosterSize = rosterSize;
    update.settings.rosterCut = rosterCut;
    update.settings.missCutScore = missCutScore;
    //update teams if roster size or team qty change
    if (teamCount != leagueCheck.settings.teamCount || rosterSize != leagueCheck.settings.rosterSize) {
        const teamsAll = await populateTeams(teamCount, rosterSize, adminId);
        update.teams= teamsAll;
        update.managers= [adminId];
    };
    const updatedLeague = await League.findByIdAndUpdate(id, update, {new: true});
    if (updatedLeague) {
        res.send(updatedLeague);
        res.status(200);
    } else {
        res.json({error: "Unable to update league"});
        res.status(400);
    }
};

// Handle league data update on POST.
exports.league_update_passcode_in = async (req, res) => {
    const {id, adminId, passcodeIn} = req.body;
    console.log(id, adminId, passcodeIn);
    //comfirm league id
    let leagueCheck = await League.findOne({_id: id});
    if (!leagueCheck) {
        res.status(401)
        throw new Error("League not found");
    }
    if (leagueCheck.admin != adminId) {
        res.status(401)
        throw new Error("Incorrect admin, not authorized");
    }
    //Update valid fields
    let update = {};
    update.passcode = passcodeIn;
    const updatedLeague = await League.findByIdAndUpdate(id, update, {new: true});
    if (updatedLeague) {
        res.send(updatedLeague);
        res.status(200);
    } else {
        res.json({error: "Unable to update league"});
        res.status(400);
    }
};

// Handle league data update on POST.
exports.league_update_passcode_auto = async (req, res) => {
    const {id, adminId} = req.body;
    console.log(id, adminId);
    //comfirm league id
    let leagueCheck = await League.findOne({_id: id});
    if (!leagueCheck) {
        res.status(401)
        throw new Error("League not found");
    }
    if (leagueCheck.admin != adminId) {
        res.status(401)
        throw new Error("Incorrect admin, not authorized");
    }
    //Update valid fields
    let update = {};
    newCode = uuidv4();
    update.passcode = newCode;
    const updatedLeague = await League.findByIdAndUpdate(id, update, {new: true});
    if (updatedLeague) {
        res.send(updatedLeague);
        res.status(200);
    } else {
        res.json({error: "Unable to update league"});
        res.status(400);
    }
};

// Handle League data delete on POST.
exports.league_delete_post = (req, res) => {
    res.send("NOT IMPLEMENTED: Genre delete POST");
};