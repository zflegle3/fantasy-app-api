const League = require("../models/league");
// const Team = require("../models/team");
// const Player = require("../models/player");
// const PlayerInstance = require("../models/playerinstance");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const { populatePlayers, populateTeams, populateChat } = require("../middleware/leagueMiddleware");
const jwt = require("jsonwebtoken");


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
    const teamsAll = await populateTeams(settings.teamCount, settings.rosterSize,req.user);
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
exports.league_update_post = (req, res) => {
    res.send("NOT IMPLEMENTED: League update data, POST");
};

// Handle League data delete on POST.
exports.league_delete_post = (req, res) => {
    res.send("NOT IMPLEMENTED: Genre delete POST");
};