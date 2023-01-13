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