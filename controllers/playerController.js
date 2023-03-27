const Player = require("../models/player");
const { loadPlayers } = require("../features/data");



// Handle read league data on GET.
exports.player_read_get = (req, res) => {
    //get player information
    res.send("NOT IMPLEMENTED: Player read data, GET");
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
};

exports.player_update_stats_all = async (req, res) => {
    const ranksUrl = "https://www.pgatour.com/stats/detail/186";
    const response = await axios.get(ranksUrl)
    .catch(function (err) {
        console.log("ERROR WITH REF SITE,", err)
    });
    const html = response.data;
    const $ = cheerio.load(html);
    //get player information
    console.log($.html());







};
