const Team = require("../models/team");
const database = require("../database/databaseActions");
const asyncHandler = require("express-async-handler");


// @desc Read Team Data
// @route POST /teams/read
// @access Private
exports.team_read_getOne = asyncHandler(async(req, res) => {
    const {id} = req.body;
    if (!id) {
        return res.status(401).json({team: null, status: "Error: invalid id, no team found"})
    };
    let teamFound = await database.getTeamById(id);
    let teamPlayers = await  database.getPlayersByTeam(id);
    if (teamFound && teamPlayers) {
        teamFound.players = teamPlayers;
        return res.status(200).json({
            team: teamFound,
            status: "team found successfully"
        });
    } else {
        return res.status(400).json({
            team: null,
            status: "unable to find team"
        });
    }
});


// @desc Update Team Data
// @route PUT /teams/update
// @access Private
exports.team_update = asyncHandler(async(req, res) => {
    const {user_id, id, name, manager, event_wins, player_wins, avatar} = req.body;
    console.log(user_id, id, name, manager, event_wins, player_wins, avatar);
    //check team exists
    let teamCheck = await database.getTeamById(id);
    if (!teamCheck) {
        return res.status(400).json({league: null, status: "Error: unable to find team" })
    }
    //check user is manager
    if (user_id != teamCheck.manager) {
        return res.status(401).json({league: null, status: "Error: user is not the team manager"})
    };
    //update team
    let updatedTeam = await database.updateTeam(id, name, manager, event_wins, player_wins, avatar);
    //return league data with updated team
    const leagueFound = await database.getLeagueById(teamCheck.league_id);
    const leagueTeams = await database.getTeamsByLeagueId(teamCheck.league_id, leagueFound.team_qty);
    const leagueTeamsWPlayers = await database.populateTeamPlayers(leagueTeams, leagueFound.roster_qty);
    const leagueActivity = await database.getActivitiesByLeagueId(teamCheck.league_id);
    if (leagueFound) {
        if (leagueTeams) {
            leagueFound.teams = leagueTeamsWPlayers;
            leagueFound.activity = leagueActivity;
        } else {
            []
        };
        return res.status(200).json({league: leagueFound, status: "league found"})
    } else {
        return res.status(400).json({league: null, status: "unable to find league"})
    }

    //previously returned updated team 
    // if (updatedTeam) {
    //     let teamFound = await database.getTeamById(id);
    //     let teamPlayers = await  database.getPlayersByTeam(id);
    //     teamFound.players = teamPlayers;
    //     return res.status(200).json({
    //         team: teamFound,
    //         status: "team updated successfully"
    //     });
    // } else {
    //     return res.status(400).json({
    //         team: null,
    //         status: "Error: unable to update team"
    //     });
    // }
});

// @desc Add player to team
// @route PUT /teams/add/player
// @access Private
exports.team_add_player = asyncHandler(async(req, res) => {
    const {user_id, team_id, player_id} = req.body;
    if (!user_id || !team_id || !player_id) {
        return res.status(401).json({team: null, status: "Error: invalid parameters"})
    };
    //check team exists 
    let teamCheck = await database.getTeamById(team_id);
    if (!teamCheck) {
        return res.status(400).json({team: null, status: "Error: unable to find team" })
    }
    //check user is manager
    if (user_id != teamCheck.manager) {
        return res.status(401).json({league: null, status: "Error: user is not the team manager"})
    };
    //check team has available roster spots
    let teamLeague = await  database.getLeagueById(teamCheck.league_id);
    let teamPlayers = await  database.getPlayersByTeam(team_id);
    if (teamPlayers.length >= teamLeague.roster_qty) {
        return res.status(400).json({team: null, status: "Error: team roster full, unable to add player" })
    }
    //check if player is on team already 
    let currentPlayer = teamPlayers.filter(player => player.player_id == player_id)
    if (currentPlayer.length > 0) {
        return res.status(400).json({team: null, status: "Error: player already on team, unable to add player" })
    }
    //add player to team 
    let playerAdded = database.addTeamPlayer(team_id, player_id);
    //return updated team with added players 
    if (playerAdded) {
        let teamFound = await database.getTeamById(team_id);
        let teamPlayersNew = await  database.getPlayersByTeam(team_id);
        teamFound.players = teamPlayersNew;
        return res.status(200).json({
            team: teamFound,
            status: "team found successfully"
        });
        //success
    } else {
        //error
        return res.status(400).json({
            team: null,
            status: "unable to find team"
        });
    }
});

// @desc Remove player from team
// @route PUT /teams/drop/player
// @access Private
exports.team_remove_player = asyncHandler(async(req, res) => {
    const {user_id, team_id, player_id} = req.body;
    if (!user_id || !team_id || !player_id) {
        return res.status(401).json({team: null, status: "Error: invalid parameters"})
    };
    //check team exists 
    let teamCheck = await database.getTeamById(team_id);
    if (!teamCheck) {
        return res.status(400).json({team: null, status: "Error: unable to find team" })
    }
    //check user is manager
    if (user_id != teamCheck.manager) {
        return res.status(401).json({league: null, status: "Error: user is not the team manager"})
    };
    //check team has available players to remove
    // let teamLeague = await  database.getLeagueById(teamCheck.league_id);
    let teamPlayers = await  database.getPlayersByTeam(team_id);
    // if (teamPlayers.length >= teamLeague.roster_qty) {
    //     return res.status(400).json({team: null, status: "Error: team roster full, unable to add player" })
    // }
    //check if player is on team 
    let currentPlayer = teamPlayers.filter(player => player.player_id == player_id)
    if (currentPlayer.length < 1) {
        return res.status(400).json({team: null, status: "Error: player not on team, unable to drop player" })
    }
    //add player to team 
    let playerRemoved = database.removeTeamPlayer(team_id, player_id);
    //return updated team with added players 
    if (playerRemoved) {
        let teamFound = await database.getTeamById(team_id);
        let teamPlayersNew = await  database.getPlayersByTeam(team_id);
        teamFound.players = teamPlayersNew;
        return res.status(200).json({
            team: teamFound,
            status: "team found successfully"
        });
        //success
    } else {
        //error
        return res.status(400).json({
            team: null,
            status: "unable to find team"
        });
    }
});
