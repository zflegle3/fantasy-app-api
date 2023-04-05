// const Team = require("../models/team");
const Player = require("../models/player");
const Chat = require("../models/chat")
const PlayerInstance = require("../models/playerinstance");
const { v4: uuidv4 } = require('uuid');

const populateTeams = async (teamQty, playerQty, adminId, adminUsername) => {
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
        if (i < 1) {
            newTeam = {
                name: `Team ${i+1}`,
                manager: {id: adminId, username: adminUsername},
                roster: roster,
                scores: {
                    rd1: 0,
                    rd2: 0,
                    rd3: 0,
                    rd4: 0
                },
            }
        } else {
            newTeam = {
                name: `Team ${i+1}`,
                roster: roster,
                manager: {id: null, username: `Manager ${i}`},
                scores: {
                    rd1: 0,
                    rd2: 0,
                    rd3: 0,
                    rd4: 0
                }
            }
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

const populateChat = async (username) => {
    const leagueChat = await Chat.create({
        name: "league chat",
        refId: uuidv4(),
        members: [username],
        messages: [{username: username, time: new Date(), msg: "League Created"}],
    })
    return leagueChat._id;
}

module.exports = {populatePlayers, populateTeams, populateChat};