#! /usr/bin/env node

console.log('This script populates some test data into the database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/?retryWrites=true&w=majority');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')

var League = require('./models/league')
var Message = require('./models/message')
var User = require('./models/user')
var Player = require('./models/player')
var Team = require('./models/team')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var messages = []
var leagues = []
var users = []
var players = []
var teams = []

const cb = function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('BOOKInstances: '+bookinstances);
        
    }
};


function userCreate(username, password, email, first_name, family_name, leagues, cb) {
    userdetail = {username:username, password:password, email:email, first_name:first_name, family_name:family_name, leagues:leagues}
    // if (genre != false) itemdetail.genre = genre
    var user = new User(userdetail);
    user.save(function (err) {
      if (err) {
        // cb(err, null)
        console.log(err);
        return
      }
      console.log('New User: ' + user);
      users.push(user)
      cb(null, user)
    }  );
}

function messageCreate(author, content, timestamp, league, cb) {
    messagedetail = {author:author, content:content, timestamp:timestamp, league:league}
    var message = new Message(messagedetail);
       
    message.save(function (err) {
        if (err) {
            // cb(err, null)
            console.log(err);
            return;
        }
        console.log('New Message: ' + message);
        messages.push(message)
        cb(null, message);
    }   );
}

function playerCreate(first_name, family_name, cb) {
    playerdetail = {first_name:first_name, family_name:family_name }
    var player = new Player(playerdetail);
       
    player.save(function (err) {
        if (err) {
            // cb(err, null)
            console.log(err);
            return;
        }
        console.log('New Player: ' + player);
        players.push(player)
        cb(null, player);
    }   );
}

function teamCreate(name, manager, roster, cb) {
    teamdetail = {name:name, manager:manager, roster:roster }
    var team = new Team(teamdetail);
       
    team.save(function (err) {
        if (err) {
            // cb(err, null)
            console.log(err);
            return;
        }
        console.log('New Team: ' + team);
        teams.push(team)
        cb(null, team);
    }   );
}

function leagueCreate(name, admin, settings, teams, activity, cb) {
  leaguedetail = { 
    name:name,
    admin: admin,
    settings: settings,
    teams: teams,
    activity: activity,
  }
    
  var league = new League(leaguedetail);    
  league.save(function (err) {
    if (err) {
        // cb(err, null)
        console.log(err);
      return
    }
    console.log('New League: ' + league);
    leagues.push(league)
    cb(null, league)
  }  );
}


function createPlayers(cb) {
    async.series([
        function(callback) {
            playerCreate('Rory', 'Mcllroy', callback);
        },
        function(callback) {
            playerCreate('Scottie', 'Scheffler', callback);
        },
        function(callback) {
            playerCreate('Cameron', 'Smith', callback);
        },
        function(callback) {
            playerCreate('Patrick', 'Cantlay', callback);
        },
        function(callback) {
            playerCreate('Jon', 'Rahm', callback);
        },
        function(callback) {
            playerCreate('Xander', 'Schauffele', callback);
        },
        function(callback) {
            playerCreate('Will', 'Zalatoris', callback);
        },
        function(callback) {
            playerCreate('Justin', 'Thomas', callback);
        },
        function(callback) {
            playerCreate('Matt', 'Fitzpatrick', callback);
        },
        function(callback) {
            playerCreate('Viktor', 'Hovland', callback);
        },
        function(callback) {
            playerCreate('Colin', 'Morikawa', callback);
        },
        function(callback) {
            playerCreate('Tony', 'Finau', callback);
        },
        function(callback) {
            playerCreate('Sam', 'Burns', callback);
        },
        function(callback) {
            playerCreate('Tom', 'Kim', callback);
        },
        function(callback) {
            playerCreate('Jordan', 'Spieth', callback);
        },
        function(callback) {
            playerCreate('Max', 'Homa', callback);
        },
        function(callback) {
            playerCreate('Cameron', 'Young', callback);
        },
        function(callback) {
            playerCreate('Billy', 'Horschel', callback);
        },
        function(callback) {
            playerCreate('Sungjae', 'Im', callback);
        },
        function(callback) {
            playerCreate('Shane', 'Lowry', callback);
        },
        function(callback) {
            playerCreate('Hideki', 'Matsuyama', callback);
        },
        function(callback) {
            playerCreate('Joaquin', 'Niemann', callback);
        },
        function(callback) {
            playerCreate('Brian', 'Harman', callback);
        },
        function(callback) {
            playerCreate('Tommy', 'Fleetwood', callback);
        },
        function(callback) {
            playerCreate('Keegan', 'Bradley', callback);
        }
        ], 
        function (err, results) {
            if (err) {
                console.log(err)
            }
            // Here, results is an array of the value from each function
            console.log(results); // outputs: ['two', 'five']
        });
}



function createTeams(cb) {
    async.series([
        function(callback) {
            teamCreate("Putter Face", "No Manager", [players[0],players[5], players[10], players[15]], players[20], callback)
        },
        function(callback) {
            teamCreate("McGavin's Mulligans", "No Manager", [players[1],players[6], players[11], players[16]], players[21], callback)
        },
        function(callback) {
            teamCreate("Fore Guys One Cup", "No Manager", [players[2],players[7], players[12], players[17]], players[22], callback)
        },
        function(callback) {
            teamCreate("Weapons of Grass Destruction", "No Manager", [players[3],players[8], players[13], players[18]], players[23], callback)
        },
        function(callback) {
            teamCreate("Putt Stuff", "No Manager", [players[4],players[9], players[14], players[19]], players[24], callback)
        },
        ],
        function (err, results) {
            if (err) {
                console.log(err)
            }
            // Here, results is an array of the value from each function
            console.log(results); // outputs: ['two', 'five']
        });
}




//create user first



function createLeagueData(cb) {
    async.series([
        //genres
        // name, admin, settings, teams, activity,

        function(callback) {
            leagueCreate("LIV Laugh Love Golfers Association", "no admin", {schedule:[], teamCount:5, missCutScore: 1, rosterCut: 1, rosterSize: 5,}, teams, ["The LIV Laugh Love Golfers Association League has been created"], callback);
        },

        function(callback) {
            userCreate("a_sandler1", "password123", "a_sandler1@gmail.com", "Happy", "Gilmore", [leagues[0]], callback);
        },
        function(callback) {
            messageCreate(users[0], "Go home ball! Are you too good for yout home?", "1/10/22", leagues[0], callback);
        },

        ],
        // optional callback
        function (err, results) {
            if (err) {
                console.log(err)
            }
            // Here, results is an array of the value from each function
            console.log(results); // outputs: ['two', 'five']
        });
}



async.series([
    createPlayers(cb),
    createTeams(cb),
    createLeagueData(cb),
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    // All done, disconnect from database
    mongoose.connection.close();
});


// function createBookInstances(cb) {
//     async.parallel([
//         function(callback) {
//           bookInstanceCreate(books[0], 'London Gollancz, 2014.', false, 'Available', callback)
//         },
//         function(callback) {
//           bookInstanceCreate(books[1], ' Gollancz, 2011.', false, 'Loaned', callback)
//         },
//         function(callback) {
//           bookInstanceCreate(books[2], ' Gollancz, 2015.', false, false, callback)
//         },
//         function(callback) {
//           bookInstanceCreate(books[3], 'New York Tom Doherty Associates, 2016.', false, 'Available', callback)
//         },
//         function(callback) {
//           bookInstanceCreate(books[3], 'New York Tom Doherty Associates, 2016.', false, 'Available', callback)
//         },
//         function(callback) {
//           bookInstanceCreate(books[3], 'New York Tom Doherty Associates, 2016.', false, 'Available', callback)
//         },
//         function(callback) {
//           bookInstanceCreate(books[4], 'New York, NY Tom Doherty Associates, LLC, 2015.', false, 'Available', callback)
//         },
//         function(callback) {
//           bookInstanceCreate(books[4], 'New York, NY Tom Doherty Associates, LLC, 2015.', false, 'Maintenance', callback)
//         },
//         function(callback) {
//           bookInstanceCreate(books[4], 'New York, NY Tom Doherty Associates, LLC, 2015.', false, 'Loaned', callback)
//         },
//         function(callback) {
//           bookInstanceCreate(books[0], 'Imprint XXX2', false, false, callback)
//         },
//         function(callback) {
//           bookInstanceCreate(books[1], 'Imprint XXX3', false, false, callback)
//         }
//         ],
//         // Optional callback
//         cb);
// }
