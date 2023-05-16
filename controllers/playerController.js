const Player = require("../models/player");
// const { loadPlayers, updatePlayerRanks, updatePlayerLeaderboard } = require("../features/data");
const {loadPlayersWorld, loadPlayersFedex, loadPlayersEvent} = require("../database/dataScraping")
const database = require("../database/databaseActions");



// Returns all player information
exports.player_read_all = async (req, res) => {
    const players = await database.getPlayersAll();
    if (players) {
        return res.status(200).json({players: players, status: "players found"});
    } else {
        return res.status(500).json({players: null, status:"Error, could not find player data"});
    };
};


// Returns single player information by id
exports.player_read_id = async (req, res) => {
    const {id} = req.body;
    const player = await database.getPlayerById(id);
    if (player) {
        return res.status(200).json({player: player, status: "players found"});
    } else {
        return res.status(500).json({player: null, status:"Error, could not find player data"});
    }
};

// Returns single player information by id
exports.player_read_world_ranks_all = async (req, res) => {
    const players = await database.getPlayerAllWorldRanks();
    if (players) {
        return res.status(200).json({players: players, status: "players found"});
    } else {
        return res.status(500).json({players: null, status:"Error, could not find player data"});
    }
};

// Returns single player information by id
exports.player_read_fedex_ranks_all = async (req, res) => {
    const players = await database.getPlayerAllFedexRanks();
    if (players) {
        return res.status(200).json({players: players, status: "players found"});
    } else {
        return res.status(500).json({players: null, status:"Error, could not find player data"});
    }
};

exports.player_read_leaderboard_all = async (req, res) => {
    const players = await database.getPlayerAllLeaderboard();
    if (players) {
        return res.status(200).json({players: players, status: "players found"});
    } else {
        return res.status(500).json({players: null, status:"Error, could not find player data"});
    }
};


exports.player_update_world_ranks_all = async (req, res) => {
    //reporting stats
    let playersAdded = 0;
    let playersUpdated = 0;
    let playersError = [];

    //Pull Golf World Rankings Data
    result = await loadPlayersWorld();
    // { EX RESULT:
    // "first_name": "Jon",
    // "last_name": "Rahm",
    // "country": "esp",
    // "world_rank": "1",
    // "world_total": "498.15",
    // "world_avg": "10.599",
    // "world_lost": "-108.46",
    // "world_gain": "319.15",
    // "world_earn": "14,462,840",
    // "world_events": "47"
    // },

    //find all Player docs in db
    // const golfersDb = await Player.find({});
    const golfersInDb = await database.getPlayersAll();
    //Splice out any player world rank results not in db already
    const newPlayers = [...result].filter(function (newPlayerData) {
        return !golfersInDb.some(function (currPlayer) {
            return newPlayerData.first_name === currPlayer.first_name && newPlayerData.last_name === currPlayer.last_name ; // return the ones with equal id
       });
    });

    //FOR ALL PLAYERS CURRENTLY IN DB, UPDATE WORLD RANKING DATA
    for (let i=0; i< golfersInDb.length; i++) {
        //SELECT DB PLAYER AND FIND IF IN TOP 200
        let playerSelected = golfersInDb[i];
        let golferWorldRanks = result.filter((rankData) => (rankData.first_name === playerSelected.first_name) && (rankData.last_name === playerSelected.last_name));
        //Update Players in the top 200 and outside the top 200
        let updatedPlayer;
        if (golferWorldRanks.length > 0) {
            //update world rank values with scraped data
            updatedPlayer = database.updatePlayerWorldRankByName(playerSelected.first_name, playerSelected.last_name, golferWorldRanks[0].country, golferWorldRanks[0].world_rank, golferWorldRanks[0].world_total, golferWorldRanks[0].world_avg, golferWorldRanks[0].world_lost, golferWorldRanks[0].world_gain, golferWorldRanks[0].world_earn, golferWorldRanks[0].world_events);
        } else {
            //reset world rank values to null
            updatedPlayer = database.updatePlayerWorldRankByName(playerSelected.first_name, playerSelected.last_name, playerSelected.country, null, null, null, null, null, null, null);
        }
        //update report stats
        if (updatedPlayer) {
            playersUpdated += 1;
        } else {
            playersError.push(`Update Document Error: ${playerSelected.first_name, playerSelected.last_name}`)
        };
    };

    //FOR PLAYERS NOT IN DB ALREADY
    for (let j=0; j< newPlayers.length; j++) {
        //add new document to db with ranks data
        let newPlayer = database.createNewPlayer(newPlayers[j].first_name, newPlayers[j].last_name, newPlayers[j].country);
        let updatedNewPlayerWorldRanks = database.updatePlayerWorldRankByName(newPlayers[j].first_name, newPlayers[j].last_name, newPlayers[j].country, newPlayers[j].world_rank, newPlayers[j].world_total, newPlayers[j].world_avg, newPlayers[j].world_lost, newPlayers[j].world_gain, newPlayers[j].world_earn, newPlayers[j].world_events);
        if (updatedNewPlayerWorldRanks) {
            playersAdded += 1;
        } else {
            playersError.push(`Add Document Error: ${playerSelected.first_name, playerSelected.last_name}`)
        };
    };

    res.status(200).json({
        playersUpdated: playersUpdated, 
        playersAdded: playersAdded,
        errors: playersError,
    });
};







exports.player_update_fedex_all = async (req, res) => {
    //reporting stats
    let playersAdded = 0;
    let playersUpdated = 0;
    let playersError = [];

    //Pull Golf World Rankings Data
    result = await loadPlayersFedex();
    // { EX RESULT:
    // "first_name": "Jon",
    // "last_name": "Rahm",
    // "country": "esp",
    // "fedex_rank": "1",
    // "fedex_total": "2983",
    // "fedex_wins": "2983",
    // "fedex_top10": "4",
    // "fedex_top25": "8",
    // "fedex_avg": "12",
    // "fedex_strokes": "67.9",
    // "fedex_rounds": "2785"
    // },
    // res.status(200).json(result);

    //find all Player docs in db
    const golfersInDb = await database.getPlayersAll();
    //Splice out any player world rank results not in db already
    const newPlayers = [...result].filter(function (newPlayerData) {
        return !golfersInDb.some(function (currPlayer) {
            return newPlayerData.first_name === currPlayer.first_name && newPlayerData.last_name === currPlayer.last_name ; // return the ones with equal id
        });
    });


    //FOR ALL PLAYERS CURRENTLY IN DB, UPDATE FEDEX RANKING DATA
    for (let i=0; i< golfersInDb.length; i++) {
        //SELECT DB PLAYER AND FIND IF IN FEDEX RANKS
        let playerSelected = golfersInDb[i];
        let golferFedexRanks = result.filter((rankData) => (rankData.first_name === playerSelected.first_name) && (rankData.last_name === playerSelected.last_name));
        //Update Players in the fedex ranks and not in fedex ranks
        let updatedPlayer;
        if (golferFedexRanks.length > 0) {
            //update world rank values with scraped data
            updatedPlayer = database.updatePlayerFedexRankByName(playerSelected.first_name, playerSelected.last_name, golferFedexRanks[0].country, golferFedexRanks[0].fedex_rank, golferFedexRanks[0].fedex_total, golferFedexRanks[0].fedex_wins, golferFedexRanks[0].fedex_top10, golferFedexRanks[0].fedex_top25, golferFedexRanks[0].fedex_avg, golferFedexRanks[0].fedex_strokes, golferFedexRanks[0].fedex_rounds);
        } else {
            //reset world rank values to null
            updatedPlayer = database.updatePlayerFedexRankByName(playerSelected.first_name, playerSelected.last_name, playerSelected.country, null, null, null, null, null, null, null, null);
        }
        //update report stats
        if (updatedPlayer) {
            playersUpdated += 1;
        } else {
            playersError.push(`Update Document Error: ${playerSelected.first_name, playerSelected.last_name}`)
        };
    };

    //FOR PLAYERS NOT IN DB ALREADY
    for (let j=0; j< newPlayers.length; j++) {
        //add new document to db with ranks data
        let newPlayer = database.createNewPlayer(newPlayers[j].first_name, newPlayers[j].last_name, newPlayers[j].country);
        let updatedNewPlayerFedexRanks = database.updatePlayerFedexRankByName(newPlayers[j].first_name, newPlayers[j].last_name, newPlayers[j].country, newPlayers[j].country, newPlayers[j].fedex_rank, newPlayers[j].fedex_total, newPlayers[j].fedex_wins, newPlayers[j].fedex_top10, newPlayers[j].fedex_top25, newPlayers[j].fedex_avg, newPlayers[j].fedex_strokes, newPlayers[j].fedex_rounds);
        if (updatedNewPlayerFedexRanks) {
            playersAdded += 1;
        } else {
            playersError.push(`Add Document Error: ${playerSelected.first_name, playerSelected.last_name}`)
        };
    };

    res.status(200).json({
        playersUpdated: playersUpdated, 
        playersAdded: playersAdded,
        errors: playersError,
    });
};



exports.player_update_leaderboard_all = async (req, res) => {
    //reporting stats
    let playersAdded = 0;
    let playersUpdated = 0;
    let playersError = [];

    //Pull Golf World Rankings Data
    result = await loadPlayersEvent();
    // { EX PLAYER RESULT
    //     "first_name": "Scott",
    //     "last_name": "Stallings",
    //     "country": "United States",
    //     "pos": "T1",
    //     "toPar": "-1",
    //     "thru": "6",
    //     "today": "-1",
    //     "rOne": "-",
    //     "rTwo": "11:18 AM",
    //     "rThree": "-",
    //     "rFour": "-",
    //     "total": "-"
    // },
    //Get event data related to current tournament 
    // res.status(200).json(result.players);
    let eventCurrent = await database.getEventsByName(result.event)

    if (eventCurrent) {
        //find all Player docs in db
        const golfersInDb = await database.getPlayersAll();
        //Splice out any player world rank results not in db already
        const newPlayers = [...result.players].filter(function (newPlayerData) {
            return !golfersInDb.some(function (currPlayer) {
                return newPlayerData.first_name === currPlayer.first_name && newPlayerData.last_name === currPlayer.last_name ; // return the ones with equal id
            });
        });

        //FOR ALL PLAYERS CURRENTLY IN DB, UPDATE FEDEX RANKING DATA
        for (let i=0; i< golfersInDb.length; i++) {
            //SELECT DB PLAYER AND FIND IF IN EVENT LEADERBOARD
            let playerSelected = golfersInDb[i];
            let golferEventLeaderboard = result.players.filter((eventData) => (eventData.first_name === playerSelected.first_name) && (eventData.last_name === playerSelected.last_name));
            //Update Players in the event leaderboard and not in event leaderboard
            let updatedPlayer;
            if (golferEventLeaderboard.length > 0) {
                //update event values with scraped data
                updatedPlayer = database.updatePlayerEventLeaderboard(playerSelected.first_name, playerSelected.last_name, eventCurrent.id, golferEventLeaderboard[0].event_pos, golferEventLeaderboard[0].event_to_par, golferEventLeaderboard[0].event_thru, golferEventLeaderboard[0].event_today, golferEventLeaderboard[0].event_r_one, golferEventLeaderboard[0].event_r_two, golferEventLeaderboard[0].event_r_three, golferEventLeaderboard[0].event_r_four, golferEventLeaderboard[0].event_total, golferEventLeaderboard[0].event_sort_total);
            } else {
                //reset event values to null
                updatedPlayer = database.updatePlayerEventLeaderboard(playerSelected.first_name, playerSelected.last_name, null, null, null, null, null, null, null, null, null, null, null);
            }
            //update report stats
            if (updatedPlayer) {
                playersUpdated += 1;
            } else {
                playersError.push(`Update Document Error: ${playerSelected.first_name, playerSelected.last_name}`)
            };
        };

        //FOR PLAYERS NOT IN DB ALREADY
        for (let j=0; j< newPlayers.length; j++) {
            //add new document to db with ranks data
            let newPlayer = database.createNewPlayer(newPlayers[j].first_name, newPlayers[j].last_name, newPlayers[j].country);
            let updatedNewPlayerEvent = database.updatePlayerEventLeaderboard(newPlayers[j].first_name, newPlayers[j].last_name, eventCurrent.id, newPlayers[j].event_pos, newPlayers[j].event_to_par, newPlayers[j].event_thru, newPlayers[j].event_today, newPlayers[j].event_r_one, newPlayers[j].event_r_two, newPlayers[j].event_r_three, newPlayers[j].event_r_four, newPlayers[j].event_total, newPlayers[j].event_sort_total);
            if (updatedNewPlayerEvent) {
                playersAdded += 1;
            } else {
                playersError.push(`Add Document Error: ${playerSelected.first_name, playerSelected.last_name}`)
            };
        };

        res.status(200).json({
            playersUpdated: playersUpdated, 
            playersAdded: playersAdded,
            errors: playersError,
        });

    } else {
        res.status(200).json({
            playersUpdated: 0, 
            playersAdded: 0,
            errors: "unable find event",
        });
    }

};


// // Populate Players in DB
// exports.player_add_db_all = async (req, res) => {
//     //get player information
//     console.log("call load")
//     const playersAll = await loadPlayers();

//     playersAdded = 0;
//     playersError = 0;
//     for (const playerNew of playersAll) {
//         //create Player document
//         const playerCreated = await Player.create({
//             first_name: playerNew.first_name,
//             family_name: playerNew.family_name,
//             tourneyStatus : true,
//         })

//         if (playerCreated) {
//             playersAdded += 1;
//         } else {
//             playersError += 1;
//             res.status(400)
//             throw new Error("Invalid data, user not created")
//         }
//     }
//     res.status(200)
//     res.send(`All ${playersAdded} Players successfully loaded`);
//     // res.send(playersAll);
// };







