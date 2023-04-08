const axios = require("axios");
const cheerio = require("cheerio");
const { v4: uuidv4 } = require('uuid');
const pdfParse = require("pdf-parse");
const fs = require('fs');
const file = "./documents/2023.pdf";
const Player = require("../models/player");
var nodemailer = require('nodemailer');

function add(accumulator, a) {
    return accumulator + a;
}


const loadPlayers = async () => {
    //Parse pdf and convert to array of strings
    let playersPdf = fs.readFileSync(file);
    let temp = [];
    await pdfParse(playersPdf).then(result => {
        temp  = result.text.split("\n");
    })

    //Slice text string to only players lines
    let end = temp.indexOf("Past champions not playing: ")
    let players = temp.slice(4,end);

    //Index through players and format name
    //Push object to array to output
    let playersOut = []
    for (let i=0; i< players.length; i++) {
        //All Names
        let selectedPlayer = players[i].split(/\(|#/);
        let playerNamesAll = selectedPlayer[0].trim().split(" ")
        //First Name
        let first = playerNamesAll[0];
        // console.log(playerNamesAll);
        //Last Name
        let last = "";
        if (playerNamesAll.length > 2) {
            // playerNamesAll.slice(1);
            last = playerNamesAll.slice(1).join(" ")
        } else {
            last = playerNamesAll[1]
        }
        playersOut.push({
            first_name: first,
            family_name: last,
        })
    }
    return playersOut
}

const updatePlayerRanks = async () => {
    // const ranksUrl = "https://www.espn.com/golf/rankings";
    const url = "https://www.cbssports.com/golf/rankings/";
    const response = await axios.get(url)
    .catch(function (err) {
        console.log("ERROR WITH REF SITE,", err)
    });
    const html = response.data;
    const $ = cheerio.load(html);
    //Table elements
    const ranks = []
    const table = $('#TableBase').find('tbody');
    $(table).find("tr").each(async function() {
        const rank = $(this).find("td:nth-child(1)").text().trim();
        const name = $(this).find("td:nth-child(2)").find(".CellPlayerName--long").find("a").text().split(" ");
        const country = $(this).find("td:nth-child(3)").text().trim();
        const average = $(this).find("td:nth-child(4)").text().trim();
        const total = $(this).find("td:nth-child(5)").text().trim();
        let earnings = $(this).find("td:nth-child(6)").text().trim();
        if (earnings.length > 1) {
            earnings = earnings.slice(1);
        } else {
            earnings = "0"
        }
        const lost = $(this).find("td:nth-child(7)").text().trim();
        const gained = $(this).find("td:nth-child(8)").text().trim();
        const events = $(this).find("td:nth-child(9)").text().trim();

        if (name && rank) {
            ranks.push({
                first_name: name[0],
                family_name: name.slice(1).join(" "),
                country: country,
                rank: rank,
                total: total,
                average: average,
                lost: lost,
                gained: gained,
                earnings: earnings,
                events, events,
            })
        }
    });
    return ranks
    // return $.html()
}




const updatePlayerFedex = async () => {
    const url = "https://www.cbssports.com/golf/rankings/cup-points/";
    const response = await axios.get(url)
    .catch(function (err) {
        console.log("ERROR WITH REF SITE,", err)
    });
    const html = response.data;
    const $ = cheerio.load(html);
    //Table elements
    const fedex = []
    const table = $('#TableBase').find('tbody');
    $(table).find("tr").each(async function() {
        const standing = $(this).find("td:nth-child(1)").text().trim();
        const name = $(this).find("td:nth-child(2)").find(".CellPlayerName--long").find("a").text().split(" ");
        const country = $(this).find("td:nth-child(3)").text().trim();
        const points = $(this).find("td:nth-child(4)").text().trim();
        const wins = $(this).find("td:nth-child(4)").text().trim();
        const top10 = $(this).find("td:nth-child(5)").text().trim();
        const top25 = $(this).find("td:nth-child(6)").text().trim();
        const scoreAvg = $(this).find("td:nth-child(9)").text().trim();
        const strokes = $(this).find("td:nth-child(10)").text().trim();
        const rounds = $(this).find("td:nth-child(11)").text().trim();

        if (name && standing) {
            fedex.push({
                first_name: name[0],
                family_name: name.slice(1).join(" "),
                country: country,
                standing: standing,
                points: points,
                wins: (wins === "—" ? 0 : wins),
                top10: (top10 === "—" ? 0 : top10),
                top25: (top25 === "—" ? 0 : top25),
                top10: (top10 === "—" ? 0 : top10),
                scoreAvg: scoreAvg,
                strokes: strokes,
                rounds: rounds,
            })
        }
    });
    return fedex
    // return $.html()
}


const updatePlayerLeaderboard = async () => { 
    const url = "https://www.cbssports.com/golf/leaderboard/pga-tour/";
    const response = await axios.get(url)
    .catch(function (err) {
        console.log("ERROR WITH REF SITE,", err)
    });
    const html = response.data;
    const $ = cheerio.load(html);
    const leaderboard = []
    const table = $('#TableGolfLeaderboard').find('tbody');

    const status = $(".Page-content").find("#hudRound").attr("data-roundstatus");
    console.log(status);
    // const status = $(".Page-content").find(".GolfLeaderboard-roundStatus").text();
    console.log("status:",status);
    if (status === "Complete") {
        console.log("Round is complete")
        //if round is complete
        $(table).find("tr.GolfLeaderboard-bodyTr").each(async function() {
            const pos = $(this).find("td:nth-child(2)").text().trim();
            const country = $(this).find("td:nth-child(3)").find("img").attr("title");
            const name = $(this).find("td:nth-child(4)").find(".CellPlayerName--long").find("a").text().split(" ");
            let toPar = $(this).find("td:nth-child(5)").text().trim();
            let thru = "-";
            let today = "-";
            const rOne = $(this).find("td:nth-child(6)").text().trim();
            const rTwo = $(this).find("td:nth-child(7)").text().trim();
            const rThree = $(this).find("td:nth-child(8)").text().trim();
            const rFour = $(this).find("td:nth-child(9)").text().trim();
            const total = $(this).find("td:nth-child(10)").text().trim();
            //value for sorting leaderboards
            let sortTotal = $(this).find("td:nth-child(5)").text().trim();
            if (sortTotal === "E") {
                sortTotal = 0;
            };
            if (sortTotal === "-") {
                sortTotal = 999;
            };
            //Handle WD Cases
            if (pos === "WD") {
                sortTotal = 999;
                toPar = "WD"
                today = "N/A"
                thru = "F"
            };
            //Handle Missed cut scores
            if (pos === "CUT") {
                sortTotal = 999;
                toPar = "CUT"
                today = "N/A"
                thru = "CUT"
            }


            if (name && pos) {
                leaderboard.push({
                    first_name: name[0],
                    family_name: name.slice(1).join(" "),
                    country: country,
                    pos: pos,
                    toPar: toPar,
                    thru: thru,
                    today: today,
                    rOne: rOne, 
                    rTwo: rTwo,
                    rThree: rThree,
                    rFour: rFour,
                    total, total,
                    sortTotal, sortTotal,
                })
            }
        });

    } else if (status === "In Progress") {
        console.log("Round is in progress")
        //if round is active
        $(table).find("tr.GolfLeaderboard-bodyTr").each(async function() {
            const pos = $(this).find("td:nth-child(2)").text().trim();
            const country = $(this).find("td:nth-child(3)").find("img").attr("title");
            const name = $(this).find("td:nth-child(4)").find(".CellPlayerName--long").find("a").text().split(" ");
            let toPar = $(this).find("td:nth-child(5)").text().trim();
            let thru = $(this).find("td:nth-child(6)").text().trim();
            let today = $(this).find("td:nth-child(7)").text().trim();
            const rOne = $(this).find("td:nth-child(8)").text().trim();
            const rTwo = $(this).find("td:nth-child(9)").text().trim();
            const rThree = $(this).find("td:nth-child(10)").text().trim();
            const rFour = $(this).find("td:nth-child(11)").text().trim();
            const total = $(this).find("td:nth-child(12)").text().trim();
            //value for sorting leaderboards
            let sortTotal = $(this).find("td:nth-child(5)").text().trim();
            if (sortTotal === "E") {
                sortTotal = 0;
            };
            if (sortTotal === "-") {
                sortTotal = 999;
            };
            //Handle WD Cases
            if (pos === "WD") {
                sortTotal = 999;
                toPar = "WD"
                today = "N/A"
                thru = "F"
            };
            //Handle Missed cut scores
            if (pos === "CUT") {
                sortTotal = 999;
                toPar = "CUT"
                today = "N/A"
                thru = "CUT"
            }

            if (name && pos) {
                leaderboard.push({
                    first_name: name[0],
                    family_name: name.slice(1).join(" "),
                    country: country,
                    pos: pos,
                    toPar: toPar,
                    thru: thru,
                    today: today,
                    rOne: rOne, 
                    rTwo: rTwo,
                    rThree: rThree,
                    rFour: rFour,
                    total, total,
                    sortTotal, sortTotal,
                })
            }
        });
    } else {
        //returning null does not update db with new data
        leaderboard = null;
    }
    return leaderboard;
}



const sendUpdate = async (updateType, message, data) => {
    //send status email on on update
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.RESET_EMAIL,
          pass: process.env.RESET_EMAIL_PASS
        }
    });
    let now = new Date().toString();

    let mailOptions = {
        from: process.env.RESET_EMAIL,
        to: "zflegle3@gmail.com",
        subject: `Masters Leaderboard Update- ${updateType} Update Status`,
        text: `${now}: ${message}... updated ${data.playersUpdated}... added ... ${data.playersAdded}errors with ${data.playersError}`,
    };

    await new Promise((resolve, reject) => {
        // send mail
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
              reject(error);
            } else {
              console.log('Email sent: ' + info.response);
              console.log(info);
              resolve(info);
            }
        });
    });

}


const autoUpdateLeaderboard = async (password) => {
    //reporting stats
    let playersAdded = 0;
    let playersUpdated = 0;
    let playersError = [];
    //confirm password sent before updating (dev use only)
    if (password === process.env.ADMIN_PASSWORD) {
        //initiate call to update db snow conditions
        //not waiting on update due to vercel timeout
        result = await updatePlayerLeaderboard();

        //find all Player docs in db
        const golfersDb = await Player.find({});
        // Splice out any players ins leaderboard results but not in db
        //Shouldn't be necessary but just in case
        const newPlayers = [...result].filter(function (newData) {
            return !golfersDb.some(function (currPlayer) {
                return newData.first_name === currPlayer.first_name && newData.family_name === currPlayer.family_name ; // return the ones with equal id
            });
        });
        console.log(newPlayers);
        //FOR PLAYERS IN DB
        for (let i=0; i< golfersDb.length; i++) {
            //SELECT DB PLAYER AND FIND IF IN TOP 200
            let playerSelected = golfersDb[i];
            let golferData = result.filter((lbData) => (lbData.first_name === playerSelected.first_name) && (lbData.family_name === playerSelected.family_name));
            //Update player document 
            const filter = { first_name: playerSelected.first_name, family_name: playerSelected.family_name};
            let update = {
                country: null,
                leaderboard: {
                    pos: null,
                }
            };

            //Players in DB and Top 200
            if (golferData.length > 0) {
                // console.log(golferData)
                update = {
                    country: golferData[0].country,
                    leaderboard: {
                        pos: golferData[0].pos,
                        toPar: golferData[0].toPar,
                        thru: golferData[0].thru,
                        today: golferData[0].today,
                        today: golferData[0].today,
                        rOne: golferData[0].rOne,
                        rTwo: golferData[0].rTwo,
                        rThree: golferData[0].rThree,
                        rFour: golferData[0].rFour,
                        total: golferData[0].total,
                        sortTotal: golferData[0].sortTotal,
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
                    standing: null,
                },
                world: {
                    rank: null,
                },
                leaderboard: {
                    pos: newPlayers[j].pos,
                    toPar: newPlayers[j].toPar,
                    thru: newPlayers[j].thru,
                    today: newPlayers[j].today,
                    today: newPlayers[j].today,
                    rOne: newPlayers[j].rOne,
                    rTwo: newPlayers[j].rTwo,
                    rThree: newPlayers[j].rThree,
                    rFour: newPlayers[j].rFour,
                    total: newPlayers[j].total,
                    sortTotal: newPlayers[j].sortTotal,
                },
            })
            if (playerCreated) {
                playersAdded += 1;
            } else {
                playersError.push(`Add Document Error: ${playerSelected.first_name, playerSelected.family_name}`)
            }
        }


        sendUpdate("Leaderboard Data","player leaderboard database update initiated", {
            playersUpdated: playersUpdated, 
            playersAdded: playersAdded,
            errors: playersError,
        });
        // if (response.status) {
        //     sendUpdate("Snow Condition Data","snow condition data updated successfully");
        // } else {
        //     sendUpdate("Snow Condition Data",`snow condition data updated with error: ${response.err}`);
        // }
        return {status: true};
    } else {
        sendUpdate("Leaderboard Data","ERROR: player leaderboard database update not initiated due to invalid credentials",
        {
            playersUpdated: playersUpdated, 
            playersAdded: playersAdded,
            errors: playersError,
        });
        return {status: false};
    }
};


const updateScores = async(teams, settings) => {
    console.log(settings);
    let tempTeams = teams;
    //for each team update player scores
    for (let i=0; i< teams.length; i++) {
        let totals = [];
        for (let j=0; j< teams[i].roster.length; j++) {
            // const filter = { first_name: teams[i].roster[j].first_name, family_name: teams[i].roster[j].family_name};
            if (teams[i].roster[j]._id === "none") {
                tempTeams[i].roster[j].score = {sortTotal: 0};
                totals.push(0);
            } else {
                const foundPlayer = await Player.find({_id: teams[i].roster[j]._id});
                //adds player score to new team copy to be pushed to db 
                tempTeams[i].roster[j].score = foundPlayer[0].leaderboard;
                //Update total score
                let playerTotal = foundPlayer[0].leaderboard.toPar;
                if (playerTotal === "E" || playerTotal === "-") {
                    totals.push(0);
                } else if (playerTotal === "WD") {
                    //Temporarily using 999 to filter out WD player scores
                    //Will need to handle case if a WD player makes the starting roster on a user's team
                    totals.push(999);
                } else if (playerTotal === "CUT") {
                    //Temporarily using 999 to filter out WD player scores
                    //Will need to handle case if a WD player makes the starting roster on a user's team
                    playerROne = Number(foundPlayer[0].rOne) -72;
                    playerRTwo = Number(foundPlayer[0].rTwo) -72;
                    //Using average of first two rounds for score
                    playerRThree = (playerROne + playerRTwo)/2;
                    //Add round 4 conditional 
                    // playerRFour = (playerROne + playerRTwo)/2;
                    totals.push(playerROne+playerRTwo+playerRThree);
                }else {
                    let opp = playerTotal.slice(0,1);
                    let value = playerTotal.slice(1);
                    if (opp === "+"){
                        totals.push(Number(value));
                    } else {
                        totals.push(Number(-value));
                    }
                    //Handle Missed Cut score
                    //if missed cut add missed cut score 
                }
            }
        }
        //calculate total team score w/ league settings
        totals.sort(function(a, b) {
            return a - b;
        });
        console.log(totals);
        //concat array based on league cut settings
        let topTotals = [] 
        if (Number(settings.rosterCut) > 0) {
            topTotals = totals.slice(0,(settings.rosterSize - settings.rosterCut));
        };
        console.log(topTotals);
        let teamTotal = topTotals.reduce(add, 0);
        tempTeams[i].total = teamTotal;
    }
    //return updated team array
    return tempTeams
} 



module.exports = { loadPlayers, updatePlayerRanks, updatePlayerFedex, updatePlayerLeaderboard, autoUpdateLeaderboard, updateScores}