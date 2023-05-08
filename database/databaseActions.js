const mysql = require("mysql");
const connection = require("./mysql.js");
const asyncHandler = require("express-async-handler");



//USER METHODS
// GET ALL USERS
exports.getUsersAll = () =>{
    sql = 'SELECT * FROM users';
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
    sql = `SELECT user_id, b.first_name, b.last_name, b.username, league_id, a.name FROM users b JOIN user_leagues ba ON ba.user_id = b.id JOIN leagues a ON ba.league_id = a.id WHERE a.id = ${league_id}`;
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result);
        });
    });
};

// GET USER BY EMAIL
exports.getUserByEmail = (email) => {
    let sql = `SELECT * FROM users WHERE email='${email}'`;
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
}

// GET USER BY USERNAME
exports.getUserByUsername = (username) => {
    let sql = `SELECT * FROM users WHERE username='${username}'`;
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
}

// GET USER BY ID
exports.getUserById = (id) => {
    let sql = `SELECT * FROM users WHERE id=${id}`;
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
}

//CREATE NEW USER
exports.createNewUser = (first_name, last_name, username, password, email) => {
    let sql = `INSERT INTO users(first_name, last_name, username, password, email) VALUES ('${first_name}', '${last_name}', '${username}', '${password}', '${email}');`;
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
}

//UPDTE EXISTING USER
exports.updateUser = (id, first_name, last_name, username, password, email) => {
    let vals = '';
    //check variables for null and only update non-null values
    if (first_name) {
        vals += `first_name = '${first_name}', `;
    }
    if (last_name) {
        vals += `last_name = '${last_name}', `;
    }
    if (username) {
        vals += `username = '${username}', `;
    }
    if (password) {
        vals += `password = '${password}', `;
    }
    if (email) {
        vals += `email = '${email}', `;
    }
    vals = vals.trim();
    let sql = `UPDATE users SET ${vals.substring(0, vals.length - 1)} WHERE id = ${id}`;
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
}

//CHAT METHODS
//CREATE NEW CHAT
exports.createNewChat = (name) => {
    let sql = `INSERT INTO chats(name) VALUES ('${name}');`;
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
}

exports.updateChat = (id, name) => {
    let vals = '';
    vals = vals.trim();
    let sql = `UPDATE chats SET name = '${name}' WHERE id = ${id};`;
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                return resolve(null);
            }
            console.log(result);
            return resolve(result[0]);
        });
    });
}

exports.getChat = (id) => {
    let sql = `SELECT * FROM chats WHERE id=${id};`;
    console.log(sql);
    return new Promise((resolve, reject)=>{
        connection.query(sql,(error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            console.log(result);
            return resolve(result[0]);
        });
    });
}

exports.getChatUsers = (id) => {
    let sql = `SELECT user_id, b.first_name, b.last_name, b.username, chat_id, a.name FROM users b JOIN user_chats ba ON ba.user_id = b.id JOIN chats a ON ba.chat_id = a.id WHERE a.id = ${id}`;
    console.log(sql);
    return new Promise((resolve, reject)=>{
        connection.query(sql,(error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            console.log(result);
            return resolve(result);
        });
    });
}







//USER CHAT METHODS
//ADD USER CHAT
exports.userAddChat= (chat_id, user_id) =>{
    sql = `INSERT INTO user_chats(user_id, chat_id) VALUES (${user_id}, ${chat_id})`;
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result);
        });
    });
};

//GET USER CHATS BY USER ID
exports.getUserChatsByUserId = (user_id) => {
    let sql = `SELECT user_id, b.username, chat_id, a.name FROM users b JOIN user_chats ba ON ba.user_id = b.id JOIN chats a ON ba.chat_id = a.id WHERE b.id = ${user_id}`;
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result);
        });
    });
}

//REMOVE USER CHAT
exports.userRemoveChat = (user_id, chat_id) => {
    sql = `DELETE FROM user_chats WHERE chat_id = ${chat_id} AND user_id = ${user_id};`;
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result);
        });
    });
};





//LEAGUE METHODS
//CREATE NEW LEAGUE
exports.createNewLeague = (chat_id, name, admin, passcode, team_qty, roster_qty, roster_cut, cut_score, ref_id) => {
    console.log(chat_id, name, admin, passcode, team_qty, roster_qty, roster_cut, cut_score, ref_id);
    let sql = `INSERT INTO leagues(chat_id, name, admin, passcode, team_qty, roster_qty, roster_cut, cut_score, ref_id) VALUES (${chat_id}, '${name}', ${admin}, '${passcode}', ${team_qty}, ${roster_qty}, ${roster_cut}, ${cut_score}, '${ref_id}');`;
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            console.log(result[0]);
            return resolve(result[0]);
        });
    });
}

exports.getLeagueByRef = (ref_id) => {
    let sql = `SELECT * FROM leagues WHERE ref_id= '${ref_id}';`;
    console.log(sql);
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                return resolve(null);
            }
            console.log(result);
            return resolve(result[0]);
        });
    });
};

exports.getLeagueById = (id) => {
    let sql = `SELECT * FROM leagues WHERE id=${id};`;
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
}

//UPDTE EXISTING LEAGUE
exports.updateLeague = (id, chat_id, name, admin, passcode, team_qty, roster_qty, roster_cut, cut_score, ref_id) => {
    let vals = '';
    //check variables for null and only update non-null values
    if (chat_id) {
        vals += `chat_id = ${chat_id}, `;
    }
    if (name) {
        vals += `name = '${name}', `;
    }
    if (admin) {
        vals += `admin = ${admin}, `;
    }
    if (passcode) {
        vals += `passcode = '${passcode}', `;
    }
    if (team_qty) {
        vals += `team_qty = ${team_qty}, `;
    }
    if (roster_qty) {
        vals += `roster_qty = ${roster_qty}, `;
    }
    if (roster_cut) {
        vals += `roster_cut = ${roster_cut}, `;
    }
    if (cut_score) {
        vals += `cut_score = '${cut_score}', `;
    }
    if (ref_id) {
        vals += `ref_id = '${ref_id}', `;
    }
    vals = vals.trim();
    let sql = `UPDATE leagues SET ${vals.substring(0, vals.length - 1)} WHERE id = ${id}`;
    console.log(sql);
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
}


exports.getUserLeaguesByUserId = (user_id) => {
    let sql = `SELECT user_id, b.username, league_id, a.name FROM users b JOIN user_leagues ba ON ba.user_id = b.id JOIN leagues a ON ba.league_id = a.id WHERE b.id = ${user_id}`;
    console.log(sql);
    return new Promise((resolve, reject)=>{
        connection.query(sql,(error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            console.log(result);
            return resolve(result);
        });
    });
}

//ADD USER LEAGUE
exports.userAddLeague = (league_id, user_id) =>{
    sql = `INSERT INTO user_leagues(user_id, league_id) VALUES (${user_id}, ${league_id})`;
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result);
        });
    });
};

exports.userRemoveLeague = (user_id, league_id) => {
    sql = `DELETE FROM user_leagues WHERE league_id = ${league_id} AND user_id = ${user_id};`;
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result);
        });
    });
};



exports.createNewMessage = (chat_id, user_id, body) => {
    sql = `INSERT INTO messages(chat_id, user_id, time, body) VALUES (${chat_id}, ${user_id}, now(), '${body}');`;
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result);
        });
    });
};

//GET RECENT MESSAGES BY CHAT ID
exports.getMessagesByChatId = (chat_id) => {
    sql = `SELECT users.username, messages.id, messages.chat_id, messages.time, messages.body FROM messages LEFT JOIN users ON users.id = messages.user_id WHERE messages.chat_id= ${chat_id} ORDER BY messages.time DESC LIMIT 10;`;
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
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
    sql = `INSERT INTO activities(league_id, user_id, time, body) VALUES (${league_id}, ${user_id}, now(), '${body}');`;
    console.log(sql);
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result);
        });
    });
};

//GET RECENT ACTIVITY BY LEAGUE ID
exports.getActivitiesByLeagueId = (league_id) => {
    sql = `SELECT users.username, activities.id, activities.league_id, activities.time, activities.body FROM activities LEFT JOIN users ON users.id = activities.user_id WHERE activities.league_id= ${league_id} ORDER BY activities.time DESC LIMIT 10;`;
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
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
    sql = `INSERT INTO teams(league_id, name, manager, event_wins, player_wins, avatar) VALUES ( ${league_id}, '${name}', ${manager}, ${event_wins}, ${player_wins}, '${avatar}');`;
    console.log(sql);
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result);
        });
    });
};

//DELETE AN EXSITING TEAM

exports.deleteTeamById = (id) => {
    sql = `DELETE FROM teams WHERE id = ${id};`;
    console.log(sql);
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                return resolve(null);
            }
            return resolve(result);
        });
    });
};

//GET TEAM BY ID
exports.getTeamById = (id) => {
    sql = `SELECT * FROM teams WHERE id=${id};`;
    console.log(sql);
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                console.log(error)
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
};

exports.getTeamsByLeagueId = (league_id) => {
    sql = `SELECT * FROM teams WHERE league_id=${league_id};`;
    console.log(sql);
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                console.log(error)
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
}

//UPDATE EXISTING TEAM
exports.updateTeam = (id, name, manager, event_wins, player_wins, avatar) => {
    let vals = '';
    //check variables for null and only update non-null values
    if (name) {
        vals += `name = '${name}', `;
    }
    if (manager) {
        vals += `manager = '${manager}', `;
    }
    if (event_wins) {
        vals += `event_wins = '${event_wins}', `;
    }
    if (player_wins) {
        vals += `player_wins = '${player_wins}', `;
    }
    if (avatar) {
        vals += `avatar = '${avatar}', `;
    }
    vals = vals.trim();
    let sql = `UPDATE teams SET ${vals.substring(0, vals.length - 1)} WHERE id = ${id}`;
    console.log(sql);
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
}


exports.getPlayersByTeam = (team_id) => {
    sql = `SELECT player_id, b.first_name, b.last_name, team_id, a.name FROM players b JOIN team_players ba ON ba.player_id = b.id JOIN teams a ON ba.team_id = a.id WHERE a.id = ${team_id}`;
    console.log(sql);
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                console.log(error)
                return resolve(null);
            }
            return resolve(result);
        });
    });
}

exports.addTeamPlayer = (team_id, player_id) => {
    sql = `INSERT INTO team_players(team_id, player_id) VALUES (${team_id}, ${player_id});`;
    console.log(sql);
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                console.log(error)
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
}

exports.removeTeamPlayer = (team_id, player_id) => {
    sql = `DELETE FROM team_players WHERE team_id = ${team_id} AND player_id = ${player_id};`;
    console.log(sql);
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                console.log(error)
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
}

//EVENT METHODS
//CREATE NEW EVENT
exports.createNewEvent = (name, date_start, date_end, status, location, course, network, defending) => {
    sql = `INSERT INTO events(name, date_start, date_end, status, location, course, network, defending) VALUES ('${name}', TIMESTAMP('${date_start}'), TIMESTAMP('${date_end}'), '${status}', '${location}', '${course}', '${network}', '${defending}');`;
    console.log(sql);
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result);
        });
    });
};


exports.getEventsByLeagueId = (league_id) => {
    sql = `SELECT event_id, b.name, b.location, b.course, b.date_start, b.date_end, b.status, b.defending, league_id, a.name FROM events b JOIN league_events ba ON ba.event_id = b.id JOIN leagues a ON ba.league_id = a.id WHERE a.id = ${league_id}`
    console.log(sql);
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result);
        });
    });
}

exports.addLeagueEvent = (league_id, event_id) => {
    sql = `INSERT INTO league_events(league_id, event_id) VALUES (${league_id}, ${event_id})`
    console.log(sql);
    console.log(sql);
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result);
        });
    });
}

exports.removeLeagueEvent = (league_id, event_id) => {
    sql = `DELETE FROM league_events WHERE league_id = ${league_id} AND event_id = ${event_id};`
    console.log(sql);
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
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
    sql = `INSERT INTO players(first_name, last_name, country, current_event, next_event, world_rank, world_total, world_avg, world_lost, world_gain, world_earn, world_events, fedex_rank, fedex_total, fedex_wins, fedex_top_10, fedex_top_25, fedex_avg, fedex_strokes, fedex_rounds, event_pos, event_to_par, event_thru, event_today, event_r_one, event_r_two, event_r_three, event_r_four, event_total, event_sort_total) VALUES ('${first_name}', '${last_name}', '${country}',null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null);`;
    console.log(sql);
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
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
    sql = `SELECT * FROM players WHERE id=${id};`;
    console.log(sql);
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
};


//GET PLAYER BY NAME
exports.getPlayerByName = (first_name, last_name) => {
    sql = `SELECT * FROM players WHERE first_name = '${first_name}' AND last_name = '${last_name}' ;`;
    console.log(sql);
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
};


exports.getPlayersByCurrentEvent = (current_event) => {
    sql = `SELECT * FROM players WHERE current_event=${current_event};`;
    console.log(sql);
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result);
        });
    });
};

exports.updatePlayerByName = (first_name, last_name, country, current_event, next_event, world_rank, world_total, world_avg, world_lost, world_gain, world_earn, world_events, fedex_rank, fedex_total, fedex_wins, fedex_top_10, fedex_top_25, fedex_avg, fedex_strokes, fedex_rounds, event_pos, event_to_par, event_thru, event_today, event_r_one, event_r_two, event_r_three, event_r_four, event_total, event_sort_total) => {
    let vals = '';
    //check variables for null and only update non-null values
    if (country) {
        vals += `country = '${country}', `;
    }
    if (current_event) {
        vals += `current_event = ${current_event}, `;
    }
    if (next_event) {
        vals += `next_event = ${next_event}, `;
    }
    if (world_rank) {
        vals += `world_rank = '${world_rank}', `;
    }
    if (world_total) {
        vals += `world_total = '${world_total}', `;
    }
    if (world_avg) {
        vals += `world_avg = '${world_avg}', `;
    }
    if (world_lost) {
        vals += `world_lost = '${world_lost}', `;
    }
    if (world_gain) {
        vals += `world_gain = '${world_gain}', `;
    }
    if (world_earn) {
        vals += `world_earn = '${world_earn}', `;
    }
    if (world_events) {
        vals += `world_events = '${world_events}', `;
    }
    if (fedex_rank) {
        vals += `fedex_rank = '${fedex_rank}', `;
    }
    if (fedex_total) {
        vals += `fedex_total = '${fedex_total}', `;
    }
    if (fedex_wins) {
        vals += `fedex_wins = '${fedex_wins}', `;
    }
    if (fedex_top_10) {
        vals += `fedex_top_10 = '${fedex_top_10}', `;
    }
    if (fedex_top_25) {
        vals += `fedex_top_25 = '${fedex_top_25}', `;
    }
    if (fedex_avg) {
        vals += `fedex_avg = '${fedex_avg}', `;
    }
    if (fedex_strokes) {
        vals += `fedex_strokes = '${fedex_strokes}', `;
    }
    if (fedex_rounds) {
        vals += `fedex_rounds = '${fedex_rounds}', `;
    }
    if (event_pos) {
        vals += `event_pos = '${event_pos}', `;
    }
    if (event_to_par) {
        vals += `event_to_par = '${event_to_par}', `;
    }
    if (event_thru) {
        vals += `event_thru = '${event_thru}', `;
    }
    if (event_today) {
        vals += `event_today = '${event_today}', `;
    }
    if (event_r_one) {
        vals += `event_r_one = '${event_r_one}', `;
    }
    if (event_r_two) {
        vals += `event_r_two = '${event_r_two}', `;
    }
    if (event_r_three) {
        vals += `event_r_three = '${event_r_three}', `;
    }
    if (event_r_four) {
        vals += `event_r_four = '${event_r_four}', `;
    }
    if (event_total) {
        vals += `event_total = '${event_total}', `;
    }
    if (event_sort_total) {
        vals += `event_sort_total = '${event_sort_total}', `;
    }
    vals = vals.trim();
    let sql = `UPDATE players SET ${vals.substring(0, vals.length - 1)} WHERE first_name = '${first_name}' AND last_name = '${last_name}'`;
    console.log(sql);
    return new Promise((resolve, reject)=>{
        connection.query(sql,  (error, result)=>{
            if(error){
                console.log(error);
                return resolve(null);
            }
            return resolve(result[0]);
        });
    });
}