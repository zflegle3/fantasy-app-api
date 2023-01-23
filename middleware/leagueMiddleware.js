const Team = require("../models/team");
const Player = require("../models/player");
const PlayerInstance = require("../models/playerinstance");

const populateTeams = async (teamQty, playerQty, admin) => {
    //for teamQty # of teams, create a team w/ playerQty # of roster spots
    //return array of teams
    let teamsOut = [];
    //populate a fake roster 
    let roster = []
    for (let j=0; j<playerQty; j++) {
        roster.push({
            _id: 0,
            first_name: "Player",
            family_name: j+1
        })
    }
    //takes in number and returns qty # of teams
    for (let i=0; i<teamQty; i++) {
        //populates admin as first team's manager
        let newTeam;
        if (i===0) {
            newTeam = await Team.create({
                name: `Team ${i+1}`,
                manager: admin._id,
                roster: roster,
            })
        } else {
            newTeam = await Team.create({
                name: `Team ${i+1}`,
                roster: roster,
                scores: {
                    rd1: 0,
                    rd2: 0,
                    rd3: 0,
                    rd4: 0
                }
            })
        }
        teamsOut.push(newTeam);
    }
    return teamsOut;
}

const populatePlayers = async () => {
    availablePlayers = [];
    //get all available players
    let playersAll = await Player.find();
    //create a player instance for each and add to array
    for (let i=0; i<playersAll.length; i++) {
        availablePlayers.push(await PlayerInstance.create({
            player: playersAll[i]._id,
            status: "available"
        }))
    }
    //return array of player instances
    return availablePlayers;
}

module.exports = {populatePlayers, populateTeams};