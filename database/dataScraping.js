const axios = require("axios");
const cheerio = require("cheerio");
const { v4: uuidv4 } = require('uuid');
// const pdfParse = require("pdf-parse");
// const fs = require('fs');
// const file = "./documents/2023.pdf";
var nodemailer = require('nodemailer');

const getYear = (month, yearStart, yearEnd) => {
    if (month === 'Sep' || month === 'Oct' || month === 'Nov' || month === 'Dec' ) {
        return yearStart;
    } else {
        return yearEnd
    }
}

const getMonth = (month) => {
    switch(month) {
        case "Jan":
            return '01';
        case "Feb":
            return '02';
        case "Mar":
            return '03';
        case "Apr":
            return '04';
        case "May":
            return '05';
        case "Jun":
            return '06';
        case "Jul":
            return '07';
        case "Aug":
            return '08';
        case "Sep":
            return '09';
        case "Oct":
            return '10';
        case "Nov":
            return '11';
        case "Dec":
            return '12';
      }
}

const formatDates = (dateArray,yearStart, yearEnd) => {
    //Get Start Date
    let dateASplit = dateArray[0].split(' ');
    let monthA = dateASplit[0];
    let dayA = dateASplit[1];
    let yearA = getYear(monthA, yearStart, yearEnd);
    //Get End Date
    let dateBSplit = dateArray[1].split(' ');
    let monthB;
    let dayB;
    if (dateBSplit.length > 1) {
        monthB = dateBSplit[0];
        dayB = dateBSplit[1];
    } else {
        monthB = monthA;
        dayB = dateBSplit[0];
    }
    let yearB = getYear(monthB, yearStart, yearEnd);
    return [`${yearA}-${getMonth(monthA)}-${dayA}`, `${yearB}-${getMonth(monthB)}-${dayB}`]
}

const loadEvents = async () => {
    let events = [];
    const url = 'https://www.cbssports.com/golf/schedules/';
    const response = await axios.get(url)
    .catch(function (err) {
        console.log("ERROR WITH REF SITE,", err);
    });
    const html = response.data;
    const $ = cheerio.load(html);
    //Extract schedule years from title
    const pageTitle = $('#PageTitle-header').text().trim();
    let titleSplit = pageTitle.split("-")
    let yearStart = titleSplit[1].trim();
    let yearEnd = titleSplit[2].trim();
    //Extract data from tables
    const tables = $('.Page-colMain');
    $(tables).find(".TableBaseWrapper").each(async function() {
        let title = $(this).find('.TableBase-title').text().trim();
        let body = $(this).find('tbody');
        $(body).find('tr').each(async function() {
            let date = $(this).find('td:nth-child(1)').text().trim();
            let datesTwo = date.split("-");
            let formattedDates = formatDates(datesTwo, yearStart, yearEnd);
            let name = $(this).find('td:nth-child(2)').text().trim();
            let location = $(this).find('td:nth-child(3)').text().trim();
            let course = $(this).find('td:nth-child(4)').text().trim();
            let purse = $(this).find('td:nth-child(5)').text().trim();
            let network = $(this).find('td:nth-child(6)').text().trim();
            let defending = $(this).find('td:nth-child(7)').find('.CellPlayerName--long').text().trim();
            let status;
            if (title === "Next Tournament" || title === "Current Tournament") {
                status = 'current';
            } else if (title === "Upcoming Tournaments") {
                status = 'upcoming';
            } else if (title === "Completed Tournaments") {
                status = 'complete';
            }
            console.log(name, defending);
            if (defending.length > 2) {
            //table populates next years events too
            //next years do not have a network or defending yet 
                let event = {
                    name: name, 
                    date_start: formattedDates[0],
                    date_end: formattedDates[1],
                    status: status, 
                    location: location, 
                    course: course, 
                    purse: purse, 
                    network: network, 
                    defending: defending, 
                    status: status
                }
                events.push(event);
            }
        });
    });
    return (events)
}

const loadPlayersWorld = async () => {
        const url = "https://www.cbssports.com/golf/rankings/";
        const response = await axios.get(url)
        .catch(function (err) {
            console.log("ERROR WITH REF SITE,", err)
        });
        const html = response.data;
        const $ = cheerio.load(html);
        //GET PLAYER DATA
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
                    last_name: name.slice(1).join(" "),
                    country: country,
                    world_rank: rank,
                    world_total: total,
                    world_avg: average,
                    world_lost: lost,
                    world_gain: gained,
                    world_earn: earnings,
                    world_events: events,
                })
            }
        });
        return ranks
        // return $.html()
}


const loadPlayersFedex = async () => {
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
        const wins = $(this).find("td:nth-child(5)").text().trim();
        const top10 = $(this).find("td:nth-child(6)").text().trim();
        const top25 = $(this).find("td:nth-child(7)").text().trim();
        const earnings = $(this).find("td:nth-child(8)").text().trim();
        const events = $(this).find("td:nth-child(9)").text().trim();
        const scoreAvg = $(this).find("td:nth-child(10)").text().trim();
        const strokes = $(this).find("td:nth-child(11)").text().trim();
        const rounds = $(this).find("td:nth-child(12)").text().trim();

        if (name && standing) {
            fedex.push({
                first_name: name[0],
                last_name: name.slice(1).join(" "),
                country: country,
                fedex_rank: standing,
                fedex_total: points,
                fedex_wins: (wins === "—" ? 0 : wins),
                fedex_top10: (top10 === "—" ? 0 : top10),
                fedex_top25: (top25 === "—" ? 0 : top25),
                fedex_avg: scoreAvg,
                fedex_strokes: strokes,
                fedex_rounds: rounds,
            })
        }
    });
    return fedex
    // return $.html()
}


const loadPlayersEvent = async () => {
    //load players from the current event leaderboard 
    const url = "https://www.cbssports.com/golf/leaderboard/pga-tour/";
    const response = await axios.get(url)
    .catch(function (err) {
        console.log("ERROR WITH REF SITE,", err)
    });
    const html = response.data;
    const $ = cheerio.load(html);
    //GET EVENT DATA
    let eventHeader = $(".GolfLeaderboard-hudTitle").text().trim();
    let eventTitle = eventHeader.replace(' Scores', '');
    console.log(eventTitle);
   

    //GET PLAYER DATA
    let leaderboard = []
    const table = $('#TableGolfLeaderboard').find('tbody');
    const status = $(".Page-content").find("#hudRound").attr("data-roundstatus");
    const round = $(".Page-content").find("#hudRound").attr("data-roundnumber");
    if (status === "Complete" && Number(round) === 4) {
        //COMPLETE ROUND AND TOURNAMENT 
        $(table).find("tr.GolfLeaderboard-bodyTr").each(async function() {
            const pos = $(this).find("td:nth-child(2)").text().trim();
            const country = $(this).find("td:nth-child(3)").find("img").attr("title");
            const name = $(this).find("td:nth-child(4)").find(".CellPlayerName--long").find("a").text().split(" ");
            let toPar = $(this).find("td:nth-child(5)").text().trim();
            let thru = "F";
            let today = "-";
            const rOne = $(this).find("td:nth-child(7)").text().trim();
            const rTwo = $(this).find("td:nth-child(8)").text().trim();
            const rThree = $(this).find("td:nth-child(9)").text().trim();
            const rFour = $(this).find("td:nth-child(10)").text().trim();
            const total = $(this).find("td:nth-child(11)").text().trim();
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
                    last_name: name.slice(1).join(" "),
                    country: country,
                    event_pos: pos,
                    event_to_par: toPar,
                    event_thru: thru,
                    event_today: today,
                    event_r_one: rOne, 
                    event_r_two: rTwo,
                    event_r_three: rThree,
                    event_r_four: rFour,
                    event_total: total,
                    event_sort_total: sortTotal,
                })
            }
        });
    } else if (status === "Complete" && Number(round) < 4) {
        //COMPLETE ROUND ACTIVE TOURNAMENT 
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
                    last_name: name.slice(1).join(" "),
                    country: country,
                    event_pos: pos,
                    event_to_par: toPar,
                    event_thru: thru,
                    event_today: today,
                    event_r_one: rOne, 
                    event_r_two: rTwo,
                    event_r_three: rThree,
                    event_r_four: rFour,
                    event_total: total,
                    event_sort_total: sortTotal,
                })
            }
        });
    } else if (status === "In Progress" || status === "Suspended") {
         //SUSPENDED ROUND ACTIVE TOURNAMENT 
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
                    last_name: name.slice(1).join(" "),
                    country: country,
                    event_pos: pos,
                    event_to_par: toPar,
                    event_thru: thru,
                    event_today: today,
                    event_r_one: rOne, 
                    event_r_two: rTwo,
                    event_r_three: rThree,
                    event_r_four: rFour,
                    event_total: total,
                    event_sort_total: sortTotal,
                })
            }
        });
    } else if (status === "Final") {
        //COMPLETE ROUND FINAL TOURNAMENT 
        $(table).find("tr.GolfLeaderboard-bodyTr").each(async function() {
            const pos = $(this).find("td:nth-child(2)").text().trim();
            const country = $(this).find("td:nth-child(3)").find("img").attr("title");
            const name = $(this).find("td:nth-child(4)").find(".CellPlayerName--long").find("a").text().split(" ");
            let toPar = $(this).find("td:nth-child(5)").text().trim();
            let thru = "F";
            let today = "-";
            const rOne = $(this).find("td:nth-child(7)").text().trim();
            const rTwo = $(this).find("td:nth-child(8)").text().trim();
            const rThree = $(this).find("td:nth-child(9)").text().trim();
            const rFour = $(this).find("td:nth-child(10)").text().trim();
            const total = $(this).find("td:nth-child(11)").text().trim();
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
                    last_name: name.slice(1).join(" "),
                    country: country,
                    event_pos: pos,
                    event_to_par: toPar,
                    event_thru: thru,
                    event_today: today,
                    event_r_one: rOne, 
                    event_r_two: rTwo,
                    event_r_three: rThree,
                    event_r_four: rFour,
                    event_total: total,
                    event_sort_total: sortTotal,
                })
            }
        });
    }
    else {
        //returning null does not update db with new data
        leaderboard = null;
    }


    return {event: eventTitle, players: leaderboard};
}







module.exports = { loadEvents, loadPlayersWorld, loadPlayersFedex, loadPlayersEvent}