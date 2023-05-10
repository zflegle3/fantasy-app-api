const League = require("../models/league");
// const Team = require("../models/team");
// const Player = require("../models/player");
// const PlayerInstance = require("../models/playerinstance");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const Team = require("../models/team");
const { populatePlayers, populateTeams, populateChat } = require("../middleware/leagueMiddleware");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');
const { updateScores } = require("../features/data")
const database = require("../database/databaseActions");


const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "30d"})
}




// @desc Create a new league
// @route POST /league/create
// @access Private
exports.league_create_new = asyncHandler(async(req, res) => {
    //protected route so can use req.user for user data
    //get data from body
    const {name, admin, team_qty, roster_qty, roster_cut, cut_score} = req.body;
    //Check for user
    let adminCheck = await database.getUserById(admin);
    if (!adminCheck) {
        return res.status(401).json({league: null, status: "unable to find admin user"})
    };
    //Create the league chat
    let newChatId = await database.createNewChat(`${name} League Chat`);
    let newLeagueId = await database.createNewLeague(newChatId, name, admin, uuidv4(), team_qty, roster_qty, roster_cut, cut_score, uuidv4());
    let leagueActivity = await database.createNewActivity(newLeagueId, admin, `${adminCheck.username} created ${name}, a new ${team_qty} team league.`);
    let adminLeague = await database.userAddLeague(newLeagueId, adminCheck.id);
    //populate teams
    for (let i=0; i< team_qty; i++) {
        //create team
        if (i === 0) {
            let newTeam = database.createNewTeam(newLeagueId, `Team ${i}`, admin, 0, 0, null);
        } else {
            let newTeam = database.createNewTeam(newLeagueId, `Team ${i}`, null, 0, 0, null);
        };
    };
    //Return admin user with updated leagues
    let userChats = await database.getUserChatsByUserId(adminCheck.id);
    let userLeagues = await database.getUserLeaguesByUserId(adminCheck.id);
    if (newLeagueId && newChatId) {
        return res.status(200).json( {
            user: {
                id: adminCheck.id,
                username: adminCheck.username,
                email: adminCheck.email,
                first_name: adminCheck.first_name,
                last_name: adminCheck.last_name,
                chats: userChats,
                leagues: userLeagues,
                token: generateToken(adminCheck.id),
            },
            status: "league created"
        });
    } else {
        return res.status(400).json( {
            user: {
                id: adminCheck.id,
                username: adminCheck.username,
                email: adminCheck.email,
                first_name: adminCheck.first_name,
                last_name: adminCheck.last_name,
                chats: userChats,
                leagues: userLeagues,
                token: generateToken(adminCheck.id),
            },
            status: "unable to create league"
        });
    }
});


// @desc Return leagues by user 
// @route GET league/getAll
// @access Private
// NOT NEEDED
// exports.league_read_getAll = asyncHandler(async(req, res) => {
//     // find leagues where user is a manager
//     const leaguesAll = await League.find({managers: req.user._id})
//     let leaguesResponse = [];
//     for (let i=0; i< leaguesAll.length; i++) {
//         leaguesResponse.push({
//             id: leaguesAll[i]._id,
//             name: leaguesAll[i].name
//         })
//     }
//     res.send(leaguesResponse);
//     res.status(200);
// });


// @desc Return league data by league id
// @route POST /leagues/read
// @access Private
exports.league_read_getOne = asyncHandler(async(req, res) => {
    //read league data from db and send 
    const {id} = req.body;
    const leagueFound = await database.getLeagueById(id);
    if (leagueFound) {
        return res.status(200).json({league: leagueFound, status: "league found"})
    } else {
        return res.status(400).json({league: null, status: "unable to find league"})
    }
});


// @desc Update league settings
// @route PUT /leagues/update/settings
// @access Private
exports.league_update_settings = async (req, res) => {
    // const {id, adminId, adminUsername, name, teamCount, rosterSize, rosterCut, missCutScore} = req.body;
    const {id, name, admin, passcode, team_qty, roster_qty, roster_cut, cut_score, ref_id} = req.body;
    //comfirm league id
    // let leagueCheck = await League.findOne({_id: id});
    let leagueCheck = await database.getLeagueById(id);
    if (!leagueCheck) {
        return res.status(401).json({league: null, status: "unable to find league" })
    }
    //confirm user is admin
    if (leagueCheck.admin != admin) {
        return res.status(401).json({league: null, status: "Error: unauthorized, user not admin" })
    }
    let leagueUpdate = await database.updateLeague(id, name, passcode, team_qty, roster_qty, roster_cut, cut_score, ref_id);
    //if league update includes team_qty or roster_qty change reset teams
    if (team_qty || roster_qty) {
        //delete existing teams
        let currentTeams = await database.getTeamsByLeagueId(id);
        for (let i=0; i< currentTeams.length; i++) {
            let deletedTeam = await database.deleteTeamById(currentTeams[i].id);
        };
        //add new teams
        for (let i=0; i< team_qty; i++) {
            //create team
            if (i === 0) {
                let newTeam = database.createNewTeam(id, `Team ${i+1}`, leagueCheck.admin, 0, 0, null);
            } else {
                let newTeam = database.createNewTeam(id, `Team ${i+1}`, null, 0, 0, null);
            };
        };
    }
    let leagueFound = await database.getLeagueById(id);
    if (leagueUpdate) {
        return res.status(200).json({league: leagueFound, status: "league updated successfully"});
    } else {
        return res.status(400).json({league: null, status: "unable to update league"});
    }
};




// @desc Update league passcode with user input
// @route PUT /leagues/update/passcode-in
// @access Private
exports.league_update_passcode_in = async (req, res) => {
    const {id, admin, passcode} = req.body;
    let leagueCheck = await database.getLeagueById(id);
    if (!leagueCheck) {
        return res.status(401).json({league: null, status: "unable to find league" })
    }
    if (leagueCheck.admin != admin) {
        return res.status(401).json({league: null, status: "Incorrect admin, not authorized"});
    }
    let leagueUpdate = await database.updateLeague(id, null, passcode, null, null, null, null, null);
    let leagueFound = await database.getLeagueById(id);
    if (leagueUpdate) {
        return res.status(200).json({league: leagueFound, status: "league updated successfully"});
    } else {
        return res.status(400).json({league: null, status: "unable to update league"});
    }
};

// @desc Update league passcode with auto generated passcode
// @route PUT /leagues/update/passcode-auto
// @access Private
exports.league_update_passcode_auto = async (req, res) => {
    let newCode = uuidv4();
    const {id, admin} = req.body;
    let leagueCheck = await database.getLeagueById(id);
    if (!leagueCheck) {
        return res.status(401).json({league: null, status: "unable to find league" })
    }
    if (leagueCheck.admin != admin) {
        return res.status(401).json({league: null, status: "Incorrect admin, not authorized"});
    }
    let leagueUpdate = await database.updateLeague(id, null, newCode, null, null, null, null, null);
    let leagueFound = await database.getLeagueById(id);
    if (leagueUpdate) {
        return res.status(200).json({league: leagueFound, status: "league updated successfully"});
    } else {
        return res.status(400).json({league: null, status: "unable to update league"});
    }
};

// Handle league data update on PUT.
exports.league_join = asyncHandler(async (req, res) => {
    const {league_id, user_id} = req.body;
    //find league by id
    let leagueCheck = await database.getLeagueById(league_id)
    if (!leagueCheck) {
        return res.status(401).json({user: null, status: "league not found"})
    }
    // Find user by id 
    let userCheck = await database.getUserById(user_id);
    if (!userCheck) {
        return res.status(401).json({user: null, status: "user not found"})
    }
	// Find teams by league
    let leagueTeams = await database.getTeamsByLeagueId(league_id);
    let userJoined = [...leagueTeams].filter(team => team.manager == user_id);
    console.log(userJoined.length);
    if (userJoined.length > 0) {
        return res.status(401).json({user: null, status: "user already joined league"})
    }
    //Join next available team and update user league relationship
    let teamsAvailable = [...leagueTeams].filter(team => !team.manager);
    if (teamsAvailable.length > 0) {
        // Update Team by id
        let updatedTeam = database.updateTeam(teamsAvailable[0].id, null, user_id, null, null, null);
        // Add relationship user leagues
        let updatedUserLeague = database.userAddLeague(league_id, user_id);
    } else {
        return res.status(401).json({user: null, status: "league full, unable to join"})
    }
    //return user with updated leagues value
    const userFound = await database.getUserById(user_id);
    let userChats = await database.getUserChatsByUserId(user_id)
    let userLeagues = await database.getUserLeaguesByUserId(user_id)
    let joinedSuccessfully = [...userLeagues.filter(league => league.league_id == league_id)]
    if (joinedSuccessfully.length > 0) {
        return res.status(200).json({
            user: {
                id: userFound.id,
                username: userFound.username,
                email: userFound.email,
                first_name: userFound.first_name,
                last_name: userFound.last_name,
                chats: userChats,
                leagues: userLeagues,
                token: generateToken(userFound.id),
            },
            status: "league joined successfully"
        });
        ;
    } else {
        return res.status(401).json({user: null, status: "Unable to join league"})
    };
});


// Handle League data delete on POST.
exports.league_delete_post = (req, res) => {
    res.send("NOT IMPLEMENTED: Genre delete POST");
};