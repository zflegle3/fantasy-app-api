const axios = require("axios");
const cheerio = require("cheerio");
const { v4: uuidv4 } = require('uuid');
const pdfParse = require("pdf-parse");
const fs = require('fs');
const file = "./documents/2023.pdf"



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
    $(table).find("tr.GolfLeaderboard-bodyTr").each(async function() {
        const pos = $(this).find("td:nth-child(2)").text().trim();
        const country = $(this).find("td:nth-child(3)").find("img").attr("title");
        const name = $(this).find("td:nth-child(4)").find(".CellPlayerName--long").find("a").text().split(" ");
        const toPar = $(this).find("td:nth-child(5)").text().trim();
        const thru = $(this).find("td:nth-child(6)").text().trim();
        const today = $(this).find("td:nth-child(7)").text().trim();
        const rOne = $(this).find("td:nth-child(8)").text().trim();
        const rTwo = $(this).find("td:nth-child(9)").text().trim();
        const rThree = $(this).find("td:nth-child(10)").text().trim();
        const rFour = $(this).find("td:nth-child(11)").text().trim();
        const total = $(this).find("td:nth-child(12)").text().trim();

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
            })
        }
    });
    return leaderboard;


}



module.exports = { loadPlayers, updatePlayerRanks, updatePlayerFedex, updatePlayerLeaderboard  }