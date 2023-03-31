const Player = require("../models/player");
const { loadPlayers, updatePlayerRanks, updatePlayerFedex } = require("../features/data");





// Returns all player information
exports.player_read_all = async (req, res) => {
    const players = await Player.find({})
    if (players) {
        res.send(players);
        res.status(200);
    } else {
        res.send("Error, could not find player data");
        res.status(500);
    }
};






// Returns single player information by id
exports.player_read_id = (req, res) => {
    //get player information
    res.send("NOT IMPLEMENTED: Returns individual player data by id");
};






// Populate Players in DB
exports.player_add_db_all = async (req, res) => {
    //get player information
    console.log("call load")
    const playersAll = await loadPlayers();

    playersAdded = 0;
    playersError = 0;
    for (const playerNew of playersAll) {
        //create Player document
        const playerCreated = await Player.create({
            first_name: playerNew.first_name,
            family_name: playerNew.family_name,
            tourneyStatus : true,
        })

        if (playerCreated) {
            playersAdded += 1;
        } else {
            playersError += 1;
            res.status(400)
            throw new Error("Invalid data, user not created")
        }
    }
    res.status(200)
    res.send(`All ${playersAdded} Players successfully loaded`);
    // res.send(playersAll);
};




exports.player_update_world_ranks_all = async (req, res) => {
    //reporting stats
    let playersAdded = 0;
    let playersUpdated = 0;
    let playersError = [];

    //Pull Golf World Rankings Data
    result = await updatePlayerRanks();
    // { EX RESULT:
    //     "first_name": "Scottie",
    //     "family_name": "Scheffler",
    //     "country": "usa",
    //     "rank": "1",
    //     "total": "533.09",
    //     "average": "10.453",
    //     "lost": "-84.34",
    //     "gained": "180.25",
    //     "earnings": "10,486,495",
    //     "events": "51"
    // },

    //find all Player docs in db
    const golfersDb = await Player.find({});
    //Splice out any players rank results but not in db
    const newPlayers = [...result].filter(function (newData) {
        return !golfersDb.some(function (currPlayer) {
            return newData.first_name === currPlayer.first_name && newData.family_name === currPlayer.family_name ; // return the ones with equal id
       });
    });
    // console.log(newPlayers);

    //FOR PLAYERS IN DB
    for (let i=0; i< golfersDb.length; i++) {
        //SELECT DB PLAYER AND FIND IF IN TOP 200
        let playerSelected = golfersDb[i];
        let golferData = result.filter((rankData) => (rankData.first_name === playerSelected.first_name) && (rankData.family_name === playerSelected.family_name));
        //Update player document 
        const filter = { first_name: playerSelected.first_name, family_name: playerSelected.family_name};
        let update = {
            country: null,
            world: {
                rank: null,
            }
        };
        //Players in DB and Top 200
        if (golferData.length > 0) {
            // console.log(golferData)
            update = {
                country: golferData[0].country,
                world: {
                    rank: golferData[0].rank,
                    total: golferData[0].total,
                    average: golferData[0].average,
                    lost: golferData[0].lost,
                    gained: golferData[0].gained,
                    earnings: golferData[0].earnings,
                    events: golferData[0].events,
                }
            }
        }
        let updatedPlayer = await Player.findOneAndUpdate(filter, update);
        //update report stats
        if (updatedPlayer) {
            playersUpdated += 1;
        } else {
            playersError.push(`Update Document Error: ${playerSelected.first_name, playerSelected.family_name}`)
        }
    }

    //FOR PLAYERS NOT IN DB ALREADY
    for (let j=0; j< newPlayers.length; j++) {
        //add new document to db with ranks data
        //add a qualified designation as false
        const playerCreated = await Player.create({
            first_name: newPlayers[j].first_name,
            family_name: newPlayers[j].family_name,
            tourneyStatus: false,
            country: newPlayers[j].country,
            world: {
                rank: newPlayers[j].rank,
                total: newPlayers[j].total,
                average: newPlayers[j].average,
                lost: newPlayers[j].lost,
                gained: newPlayers[j].gained,
                earnings: newPlayers[j].earnings,
                events: newPlayers[j].events,
            },
            fedex: {
                standing: null
            }
        })
        if (playerCreated) {
            playersAdded += 1;
        } else {
            playersError.push(`Add Document Error: ${playerSelected.first_name, playerSelected.family_name}`)
        }
    }

    res.status(200)
    // res.send(`All ${playersUpdated} Players successfully updated`);
    res.send({
        playersUpdated: playersUpdated, 
        playersAdded: playersAdded,
        errors: playersError,
    })
};







exports.player_update_fedex_all = async (req, res) => {
    //reporting stats
    let playersAdded = 0;
    let playersUpdated = 0;
    let playersError = [];

    //Pull Golf World Rankings Data
    result = await updatePlayerFedex();
    // { EX RESULT:
    //     "first_name": "Jon",
    //     "family_name": "Rahm",
    //     "country": "esp",
    //     "standing": "1",
    //     "points": "2031",
    //     "wins": "2031",
    //     "top10": "3",
    //     "top25": "6",
    //     "scoreAvg": "9",
    //     "strokes": "68.0",
    //     "rounds": "1973"
    // },

    //find all Player docs in db
    const golfersDb = await Player.find({});
    //Splice out any players ins fedex results but not in db
    const newPlayers = [...result].filter(function (newData) {
        return !golfersDb.some(function (currPlayer) {
            return newData.first_name === currPlayer.first_name && newData.family_name === currPlayer.family_name ; // return the ones with equal id
       });
    });
    // console.log(newPlayers);

    //FOR PLAYERS IN DB
    for (let i=0; i< golfersDb.length; i++) {
        //SELECT DB PLAYER AND FIND IF IN TOP 200
        let playerSelected = golfersDb[i];
        let golferData = result.filter((fedexData) => (fedexData.first_name === playerSelected.first_name) && (fedexData.family_name === playerSelected.family_name));
        //Update player document 
        const filter = { first_name: playerSelected.first_name, family_name: playerSelected.family_name};
        let update = {
            country: null,
            fedex: {
                standing: null,
            }
        };
        //Players in DB and Top 200
        if (golferData.length > 0) {
            // console.log(golferData)
            update = {
                country: golferData[0].country,
                fedex: {
                    standing: golferData[0].standing,
                    ppints: golferData[0].points,
                    wins: golferData[0].wins,
                    top10: golferData[0].top10,
                    top25: golferData[0].top25,
                    scoreAvg: golferData[0].scoreAvg,
                    strokes: golferData[0].strokes,
                    rounds: golferData[0].rounds,
                }
            }
        }
        let updatedPlayer = await Player.findOneAndUpdate(filter, update);
        //update report stats
        if (updatedPlayer) {
            playersUpdated += 1;
        } else {
            playersError.push(`Update Document Error: ${playerSelected.first_name, playerSelected.family_name}`)
        }
    }

    //FOR PLAYERS NOT IN DB ALREADY
    for (let j=0; j< newPlayers.length; j++) {
        //add new document to db with fedex data
        //add a qualified designation as false
        const playerCreated = await Player.create({
            first_name: newPlayers[j].first_name,
            family_name: newPlayers[j].family_name,
            tourneyStatus: false,
            country: newPlayers[j].country,
            fedex: {
                standing: newPlayers[j].standing,
                ppints: newPlayers[j].points,
                wins: newPlayers[j].wins,
                top10: newPlayers[j].top10,
                top25: newPlayers[j].top25,
                scoreAvg: newPlayers[j].scoreAvg,
                strokes: newPlayers[j].strokes,
                rounds: newPlayers[j].rounds,
            },
            world: {
                rank: null,
            },
        })
        if (playerCreated) {
            playersAdded += 1;
        } else {
            playersError.push(`Add Document Error: ${playerSelected.first_name, playerSelected.family_name}`)
        }
    }

    res.status(200)
    res.send({
        playersUpdated: playersUpdated, 
        playersAdded: playersAdded,
        errors: playersError,
    });
};







