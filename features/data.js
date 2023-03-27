const axios = require("axios");
const cheerio = require("cheerio");
const { v4: uuidv4 } = require('uuid');
const pdfParse = require("pdf-parse");
const fs = require('fs');
const file = "./documents/2023.pdf"
const Player = require("../models/player")



const loadPlayers = async () => {
    //Parse pdf and convert to array of strings
    let playersPdf = fs.readFileSync(file);
    let temp = [];
    await pdfParse(playersPdf).then(result => {
        temp  = result.text.split("\n");
    })

    //Slice text string to only players lines
    let end = temp.indexOf("Past champions not playing: ")
    console.log(end);
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
        //Last Name
        let last = "";
        if (playerNamesAll.length > 2) {
            playerNamesAll.slice(1);
            last = playerNamesAll.join(" ")
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



module.exports = { loadPlayers }