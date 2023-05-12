const mysql = require("mysql");
const connection = require("./mysql.js");
const asyncHandler = require("express-async-handler");
const chat = require("../models/chat.js");



//USER METHODS
// GET ALL USERS
exports.getUsersAll = () =>{
    let sql = 'SELECT * FROM users';
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result);
        });
    });
};

// GET ALL USERS BY LEAGUE
exports.getUsersByLeague = (league_id) =>{
    let sql = `SELECT user_id, b.first_name, b.last_name, b.username, league_id, a.name FROM users b JOIN user_leagues ba ON ba.user_id = b.id JOIN leagues a ON ba.league_id = a.id WHERE a.id = ?}`;
    let params = [league_id];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result);
        });
    });
};

// GET USER BY EMAIL
exports.getUserByEmail = (email) => {
    let sql = `SELECT * FROM users WHERE email= ?`;
    let params = [email];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
}

// GET USER BY USERNAME
exports.getUserByUsername = (username) => {
    let sql = `SELECT * FROM users WHERE username= ?`;
    let params = [username]
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
}

// GET USER BY ID
exports.getUserById = (id) => {
    let sql = `SELECT * FROM users WHERE id= ?`;
    let params = [id];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result) => {
            if(error){
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
}

//CREATE NEW USER
exports.createNewUser = (first_name, last_name, username, password, email) => {
    let sql = `INSERT INTO users(first_name, last_name, username, password, email) VALUES (?, ?, ?, ?, ?);`;
    let params = [first_name, last_name, username, password, email];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params,  (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
}

//UPDTE EXISTING USER
exports.updateUser = (id, first_name, last_name, username, password, email) => {
    //function
    let vals = '';
    let params = [];
    //check variables for null and only update non-null values
    if (first_name) {
        vals += `first_name = ?, `;
        params.push(first_name)
    }
    if (last_name) {
        vals += `last_name = ?, `;
        params.push(last_name)
    }
    if (username) {
        vals += `username = ?, `;
        params.push(username)
    }
    if (password) {
        vals += `password = ?, `;
        params.push(password)
    }
    if (email) {
        vals += `email = ?, `;
        params.push(email)
    }
    params.push(id);
    vals = vals.trim();
    let sql = `UPDATE users SET ${vals.substring(0, vals.length - 1)} WHERE id = ?`;
    console.log(sql, params);
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error)
                return resolve(null);
            }
            return resolve(true);
        });
    });
}

//CHAT METHODS
//CREATE NEW CHAT
exports.createNewChat = (name) => {
    let sql = `INSERT INTO chats(name) VALUES (?); SELECT LAST_INSERT_ID();`;
    let params = [name];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            //returns id of created chat
            return resolve(result[1][0]['LAST_INSERT_ID()']);
        });
    });
}

exports.deleteChat = (id) => {
    let sql = 'DELETE FROM chats WHERE id = ?;';
    let params = [id];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                return resolve(false);
            }
            return resolve(true);
        });
    });
}

exports.updateChat = (id, name) => {
    let vals = '';
    let params = [name, id]
    vals = vals.trim();
    let sql = `UPDATE chats SET name = ? WHERE id = ?;`;
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                return resolve(false);
            }
            return resolve(true);
        });
    });
}

exports.getChat = (id) => {
    let sql = `SELECT * FROM chats WHERE id= ?;`;
    let params = [id];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
}

exports.getChatUsers = (id) => {
    let sql = `SELECT user_id, b.first_name, b.last_name, b.username FROM users b JOIN user_chats ba ON ba.user_id = b.id JOIN chats a ON ba.chat_id = a.id WHERE a.id = ?`;
    let params = [id];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result);
        });
    });
}







//USER CHAT METHODS
//ADD USER CHAT
exports.userAddChat= (chat_id, user_id) => {
    sql = `INSERT INTO user_chats(user_id, chat_id) VALUES (?, ?)`;
    let params = [user_id, chat_id,];
    console.log(sql);
    console.log(params);
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(true);
        });
    });
};

//GET USER CHATS BY USER ID
exports.getUserChatsByUserId = (user_id) => {
    let sql = `SELECT user_id, b.username, chat_id, a.name FROM users b JOIN user_chats ba ON ba.user_id = b.id JOIN chats a ON ba.chat_id = a.id WHERE b.id = ?`;
    let params = [user_id];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result);
        });
    });
}

//REMOVE USER CHAT
exports.userRemoveChat = (user_id, chat_id) => {
    let sql = `DELETE FROM user_chats WHERE chat_id = ? AND user_id = ?;`;
    let params = [chat_id, user_id];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(true);
        });
    });
};





//LEAGUE METHODS
//CREATE NEW LEAGUE
exports.createNewLeague = (chat_id, name, admin, passcode, team_qty, roster_qty, roster_cut, cut_score, ref_id) => {
    let sql = `INSERT INTO leagues(chat_id, name, admin, passcode, team_qty, roster_qty, roster_cut, cut_score, ref_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?); SELECT LAST_INSERT_ID();`;
    let params = [chat_id, name, admin, passcode, team_qty, roster_qty, roster_cut, cut_score, ref_id]
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            //returns id of created league
            return resolve(result[1][0]['LAST_INSERT_ID()']);
        });
    });
}

exports.getLeagueByRef = (ref_id) => {
    let sql = `SELECT * FROM leagues WHERE ref_id= ?;`;
    let params = [ref_id];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
};

exports.getLeagueById = (id) => {
    let sql = `SELECT * FROM leagues WHERE id= ?;`;
    let params = [id];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
}

//UPDTE EXISTING LEAGUE
exports.updateLeague = (id, name, passcode, team_qty, roster_qty, roster_cut, cut_score, ref_id) => {
    let params=[];
    let vals = '';
    //check variables for null and only update non-null values
    if (name) {
        vals += `name = ?, `;
        params.push(name);
    }
    if (passcode) {
        vals += `passcode = ?, `;
        params.push(passcode);
    }
    if (team_qty) {
        vals += `team_qty = ?, `;
        params.push(team_qty);
    }
    if (roster_qty) {
        vals += `roster_qty = ?, `;
        params.push(roster_qty);
    }
    if (roster_cut) {
        vals += `roster_cut = ?, `;
        params.push(roster_cut);
    }
    if (cut_score) {
        vals += `cut_score = ?, `;
        params.push(cut_score);
    }
    if (ref_id) {
        vals += `ref_id = ?, `;
        params.push(ref_id);
    }
    params.push(id);
    vals = vals.trim();
    let sql = `UPDATE leagues SET ${vals.substring(0, vals.length - 1)} WHERE id = ?`;
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(false);
            }
            return resolve(true);
        });
    });
}


exports.getUserLeaguesByUserId = (user_id) => {
    let sql = `SELECT user_id, b.username, league_id, a.name FROM users b JOIN user_leagues ba ON ba.user_id = b.id JOIN leagues a ON ba.league_id = a.id WHERE b.id = ?`;
    let params = [user_id];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result);
        });
    });
}

//ADD USER LEAGUE
exports.userAddLeague = (league_id, user_id) =>{
    let sql = `INSERT INTO user_leagues(user_id, league_id) VALUES (?, ?)`;
    let params = [user_id, league_id]
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result);
        });
    });
};

exports.userRemoveLeague = (user_id, league_id) => {
    let sql = `DELETE FROM user_leagues WHERE league_id = ? AND user_id = ?;`;
    let params = [league_id, user_id]
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result);
        });
    });
};



exports.createNewMessage = (chat_id, user_id, body) => {
    let sql = `INSERT INTO messages(chat_id, user_id, time, body) VALUES (?, ?, now(), ?);`;
    let params = [chat_id, user_id, body]
    return new Promise((resolve, reject)=>{
        connection.query(sql, params,  (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result);
        });
    });
};

//GET RECENT MESSAGES BY CHAT ID
exports.getMessagesByChatId = (chat_id) => {
    sql = `SELECT users.username, messages.id, messages.chat_id, messages.time, messages.body FROM messages LEFT JOIN users ON users.id = messages.user_id WHERE messages.chat_id= ? ORDER BY messages.time DESC LIMIT 10;`;
    let params = [chat_id];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result);
        });
    });
}


//ACTIVITY METHODS
//CREATE NEW ACTIVITY
exports.createNewActivity = (league_id, user_id, body) => {
    let sql = `INSERT INTO activities(league_id, user_id, time, body) VALUES (?, ?, now(), ?);`;
    let params = [league_id, user_id, body];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result);
        });
    });
};

//GET RECENT ACTIVITY BY LEAGUE ID
exports.getActivitiesByLeagueId = (league_id) => {
    let sql = `SELECT users.username, activities.id, activities.league_id, activities.time, activities.body FROM activities LEFT JOIN users ON users.id = activities.user_id WHERE activities.league_id= ? ORDER BY activities.time DESC LIMIT 10;`;
    let params = [league_id];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result);
        });
    });
}

//TEAM METHODS
//CREATE A NEW TEAM
exports.createNewTeam = (league_id, name, manager, event_wins, player_wins, avatar) => {
    let sql = `INSERT INTO teams(league_id, name, manager, event_wins, player_wins, avatar) VALUES ( ?, ?, ?, ?, ?, ?);  SELECT LAST_INSERT_ID();`;
    let params = [league_id, name, manager, event_wins, player_wins, avatar];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            //returns id of created team
            return resolve(result[1][0]['LAST_INSERT_ID()']);
        });
    });
};

//DELETE AN EXSITING TEAM

exports.deleteTeamById = (id) => {
    console.log(id);
    let sql = `DELETE FROM teams WHERE id = ?;`;
    let params = [id];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result);
        });
    });
};

//GET TEAM BY ID
exports.getTeamById = (id) => {
    let sql = `SELECT * FROM teams WHERE id= ?;`;
    let params = [id];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error)
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
};

exports.getTeamsByLeagueId = (league_id) => {
    let sql = `SELECT * FROM teams WHERE league_id= ?;`;
    let params = [league_id];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error)
                return resolve(null);
            }
            return resolve(result);
        });
    });
}

//UPDATE EXISTING TEAM
exports.updateTeam = (id, name, manager, event_wins, player_wins, avatar) => {
    let params = [];
    let vals = '';
    //check variables for null and only update non-null values
    if (name) {
        vals += `name = ?, `;
        params.push(name);
    }
    if (manager) {
        vals += `manager = ?, `;
        params.push(manager);
    }
    if (event_wins) {
        vals += `event_wins = ?, `;
        params.push(event_wins);
    }
    if (player_wins) {
        vals += `player_wins = ?, `;
        params.push(player_wins);
    }
    if (avatar) {
        vals += `avatar = ?, `;
        params.push(avatar);
    }
    params.push(id);
    vals = vals.trim();
    let sql = `UPDATE teams SET ${vals.substring(0, vals.length - 1)} WHERE id = ?`;
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(false);
            }
            return resolve(true);
        });
    });
}


exports.getPlayersByTeam = (team_id) => {
    let sql = `SELECT player_id, b.first_name, b.last_name, team_id, a.name FROM players b JOIN team_players ba ON ba.player_id = b.id JOIN teams a ON ba.team_id = a.id WHERE a.id = ?`;
    let params = [team_id]
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error)
                return resolve(null);
            }
            return resolve(result);
        });
    });
}

exports.addTeamPlayer = (team_id, player_id) => {
    let sql = `INSERT INTO team_players(team_id, player_id) VALUES (?, ?);`;
    let params = [team_id, player_id];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error)
                return resolve(false);
            }
            return resolve(true);
        });
    });
}

exports.removeTeamPlayer = (team_id, player_id) => {
    let sql = `DELETE FROM team_players WHERE team_id = ? AND player_id = ?;`;
    let params = [team_id, player_id];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error)
                return resolve(false);
            }
            return resolve(true);
        });
    });
}

//EVENT METHODS
//CREATE NEW EVENT
exports.createNewEvent = (name, date_start, date_end, status, location, course, network, defending, purse) => {
    let sql = `INSERT INTO events(name, date_start, date_end, status, location, course, network, defending, purse) VALUES (?, TIMESTAMP(?), TIMESTAMP(?), ?, ?, ?, ?, ?, ?);`;
    let params = [name, date_start, date_end, status, location, course, network, defending, purse];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(true);
        });
    });
};

//UPDATE EXISTING TEAM
exports.updateEvent = (id, name, date_start, date_end, status, location, course, network, defending, purse) => {
    let params = [];
    let vals = '';
    //check variables for null and only update non-null values
    if (name) {
        vals += `name = ?, `;
        params.push(name);
    }
    if (date_start) {
        vals += `date_start = ?, `;
        params.push(date_start);
    }
    if (date_end) {
        vals += `date_end = ?, `;
        params.push(date_end);
    }
    if (status) {
        vals += `status = ?, `;
        params.push(status);
    }
    if (location) {
        vals += `location = ?, `;
        params.push(location);
    }
    if (course) {
        vals += `course = ?, `;
        params.push(course);
    }
    if (network) {
        vals += `network = ?, `;
        params.push(network);
    }
    if (defending) {
        vals += `defending = ?, `;
        params.push(defending);
    }
    if (purse) {
        vals += `purse = ?, `;
        params.push(purse);
    }
    params.push(id);
    vals = vals.trim();
    let sql = `UPDATE events SET ${vals.substring(0, vals.length - 1)} WHERE id = ?`;
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(false);
            }
            return resolve(true);
        });
    });
}

exports.getEventsById = (id) => {
    let sql = `SELECT * FROM events WHERE id= ?;`;
    let params = [id];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
};

exports.getEventsByName = (name) => {
    let sql = `SELECT * FROM events WHERE name= ?;`;
    let params = [name];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
};


exports.getEventsByLeagueId = (league_id) => {
    let sql = `SELECT event_id, b.name, b.location, b.course, b.date_start, b.date_end, b.status, b.defending, league_id, a.name FROM events b JOIN league_events ba ON ba.event_id = b.id JOIN leagues a ON ba.league_id = a.id WHERE a.id = ?`;
    let params = [league_id];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result);
        });
    });
}

exports.addLeagueEvent = (league_id, event_id) => {
    let sql = `INSERT INTO league_events(league_id, event_id) VALUES (?, ?)`;
    let params = [league_id, event_id];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result);
        });
    });
}

exports.removeLeagueEvent = (league_id, event_id) => {
    let sql = `DELETE FROM league_events WHERE league_id = ? AND event_id = ?;`
    let params = [league_id, event_id];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result);
        });
    });
}


//PLAYER METHODS
//CREATE NEW PLAYER
exports.createNewPlayer = (first_name, last_name, country) => {
    let sql = `INSERT INTO players(first_name, last_name, country, current_event, next_event, world_rank, world_total, world_avg, world_lost, world_gain, world_earn, world_events, fedex_rank, fedex_total, fedex_wins, fedex_top_10, fedex_top_25, fedex_avg, fedex_strokes, fedex_rounds, event_pos, event_to_par, event_thru, event_today, event_r_one, event_r_two, event_r_three, event_r_four, event_total, event_sort_total) VALUES (?, ?, ?, null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null);`;
    let params = [first_name, last_name, country];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result);
        });
    });
};

//GET PLAYER BY ID
exports.getPlayerById = (id) => {
    let sql = `SELECT * FROM players WHERE id= ?;`;
    let params = [id];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
};

exports.getPlayersAll = () => {
    let sql = `SELECT * FROM players;`;
    return new Promise((resolve, reject)=>{
        connection.query(sql,(error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result);
        });
    }); 
}

//GET PLAYER BY ID
exports.getPlayerAllWorldRanks = (id) => {
    let sql = `SELECT * FROM players WHERE world_rank IS NOT NULL ORDER BY world_rank;`;
    let params = [id];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result);
        });
    });
};

//GET PLAYER BY ID
exports.getPlayerAllFedexRanks = (id) => {
    let sql = `SELECT * FROM players WHERE fedex_rank IS NOT NULL ORDER BY fedex_rank;`;
    let params = [id];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result);
        });
    });
};


//GET PLAYER BY NAME
exports.getPlayerByName = (first_name, last_name) => {
    let sql = `SELECT * FROM players WHERE first_name = ? AND last_name = ? ;`;
    let params = [first_name, last_name];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
};


exports.getPlayersByCurrentEvent = (current_event) => {
    let sql = `SELECT * FROM players WHERE current_event= ?;`;
    let params = [current_event];
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result);
        });
    });
};

exports.updatePlayerByName = (first_name, last_name, country, current_event, next_event, world_rank, world_total, world_avg, world_lost, world_gain, world_earn, world_events, fedex_rank, fedex_total, fedex_wins, fedex_top_10, fedex_top_25, fedex_avg, fedex_strokes, fedex_rounds, event_pos, event_to_par, event_thru, event_today, event_r_one, event_r_two, event_r_three, event_r_four, event_total, event_sort_total) => {
    let params = [];
    let vals = '';
    //check variables for null and only update non-null values
    if (country) {
        vals += `country = ?, `;
        params.push(country);
    }
    if (current_event) {
        vals += `current_event = ?, `;
        params.push(current_event);
    }
    if (next_event) {
        vals += `next_event = ?, `;
        params.push(next_event);
    }
    if (world_rank) {
        vals += `world_rank = ?, `;
        params.push(world_rank);
    }
    if (world_total) {
        vals += `world_total = ?, `;
        params.push(world_total);
    }
    if (world_avg) {
        vals += `world_avg = ?, `;
        params.push(world_avg);
    }
    if (world_lost) {
        vals += `world_lost = ?, `;
        params.push(world_lost);
    }
    if (world_gain) {
        vals += `world_gain = ?, `;
        params.push(world_gain);
    }
    if (world_earn) {
        vals += `world_earn = ?, `;
        params.push(world_earn);
    }
    if (world_events) {
        vals += `world_events = ?, `;
        params.push(world_events);
    }
    if (fedex_rank) {
        vals += `fedex_rank = ?, `;
        params.push(fedex_rank);
    }
    if (fedex_total) {
        vals += `fedex_total = ?, `;
        params.push(fedex_total);
    }
    if (fedex_wins) {
        vals += `fedex_wins = ?, `;
        params.push(fedex_wins);
    }
    if (fedex_top_10) {
        vals += `fedex_top_10 = ?, `;
        params.push(fedex_top_10);
    }
    if (fedex_top_25) {
        vals += `fedex_top_25 = ?, `;
        params.push(fedex_top_25);
    }
    if (fedex_avg) {
        vals += `fedex_avg = ?, `;
        params.push(fedex_avg);
    }
    if (fedex_strokes) {
        vals += `fedex_strokes = ?, `;
        params.push(fedex_strokes);
    }
    if (fedex_rounds) {
        vals += `fedex_rounds = ?, `;
        params.push(fedex_rounds);
    }
    if (event_pos) {
        vals += `event_pos = ?, `;
        params.push(event_pos);
    }
    if (event_to_par) {
        vals += `event_to_par = ?, `;
        params.push(event_to_par);
    }
    if (event_thru) {
        vals += `event_thru = ?, `;
        params.push(event_thru);
    }
    if (event_today) {
        vals += `event_today = ?, `;
        params.push(event_today);
    }
    if (event_r_one) {
        vals += `event_r_one = ?, `;
        params.push(event_r_one);
    }
    if (event_r_two) {
        vals += `event_r_two = ?, `;
        params.push(event_r_two);
    }
    if (event_r_three) {
        vals += `event_r_three = ?, `;
        params.push(event_r_three);
    }
    if (event_r_four) {
        vals += `event_r_four = ?, `;
        params.push(event_r_four);
    }
    if (event_total) {
        vals += `event_total = ?, `;
        params.push(event_total);
    }
    if (event_sort_total) {
        vals += `event_sort_total = ?, `;
        params.push(event_sort_total);
    }
    params.push(first_name);
    params.push(last_name);
    vals = vals.trim();
    let sql = `UPDATE players SET ${vals.substring(0, vals.length - 1)} WHERE first_name = ? AND last_name = ?`;
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(true);
        });
    });
}

exports.updatePlayerWorldRankByName = (first_name, last_name, country, world_rank, world_total, world_avg, world_lost, world_gain, world_earn, world_events) => {
    let params = [country, world_rank, world_total, world_avg, world_lost, world_gain, world_earn, world_events, first_name, last_name];
    let sql = `UPDATE players SET country = ?, world_rank = ?, world_total = ?, world_avg = ?, world_lost = ?, world_gain = ?, world_earn = ?, world_events = ?  WHERE first_name = ? AND last_name = ?`;
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(true);
        });
    });
}

exports.updatePlayerFedexRankByName = (first_name, last_name, country, fedex_rank, fedex_total, fedex_wins, fedex_top10, fedex_top25, fedex_avg, fedex_strokes, fedex_rounds) => {
    let params = [country, fedex_rank, fedex_total, fedex_wins, fedex_top10, fedex_top25, fedex_avg, fedex_strokes, fedex_rounds, first_name, last_name];
    let sql = `UPDATE players SET country = ?, fedex_rank = ?, fedex_total = ?, fedex_wins = ?, fedex_top_10 = ?, fedex_top_25 = ?, fedex_avg = ?, fedex_strokes = ?, fedex_rounds = ?  WHERE first_name = ? AND last_name = ?`;
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(true);
        });
    });
}

exports.updatePlayerEventLeaderboard = (first_name, last_name, event_id, event_pos, event_to_par, event_thru, event_today, event_r_one, event_r_two, event_r_three, event_r_four, event_total, event_sort_total) => {
    let params = [event_id, event_pos, event_to_par, event_thru, event_today, event_r_one, event_r_two, event_r_three, event_r_four, event_total, event_sort_total, first_name, last_name];
    let sql = `UPDATE players SET current_event = ?, event_pos = ?, event_to_par = ?, event_thru = ?, event_today = ?, event_r_one = ?, event_r_two = ?, event_r_three = ?, event_r_four = ?, event_total = ?, event_sort_total = ?  WHERE first_name = ? AND last_name = ?`;
    return new Promise((resolve, reject)=>{
        connection.query(sql, params, (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(true);
        });
    });
}