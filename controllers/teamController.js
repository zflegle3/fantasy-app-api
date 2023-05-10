const Team = require("../models/team");


// Handle read team data on GET.
exports.team_read_get = (req, res) => {
    //get team data from database and send
    res.send("NOT IMPLEMENTED: Team read data, GET");
};

// Handle team data create on POST.
exports.team_create_post = (req, res) => {
    //create new team data
    res.send("NOT IMPLEMENTED: Team create data, POST");
};

// Handle team data update on POST.
exports.team_update_post = (req, res) => {
    //update existing team data
    res.send("NOT IMPLEMENTED: Team update data, POST");
};

// Handle team data delete on POST.
exports.team_delete_post = (req, res) => {
    //delete existing team data
    res.send("NOT IMPLEMENTED: Team delete POST");
};

// Handle league data update on POST.
exports.team_update = async (req, res) => {
    const {leagueId, managerId, nameIn} = req.body;
    let leagueCheck = await League.findOne({_id: leagueId});
    if (!leagueCheck) {
        res.status(401)
        res.send({msg: "League not found"})
    }

    let teamsTemp = [...leagueCheck.teams];

    let teamsMatch = leagueCheck.teams.filter(team => team.manager.id === managerId);
    if (teamsMatch.length != 1) {
        res.status(403)
        res.send({msg: "Unable to find team"})
    }
    let teamUpdated = teamsMatch[0];
    let index = teamsTemp.indexOf(teamUpdated);
    teamUpdated.name = nameIn;
    teamsTemp[index] = teamUpdated;

    let updatedLeague = await League.findByIdAndUpdate(leagueId, {teams: teamsTemp});
    if (updatedLeague) {
        res.send(updatedLeague);
        res.status(200);
    } else {
        res.json({error: "Unable to update league"});
        res.status(400);
    }
};