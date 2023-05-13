var express = require('express');
var router = express.Router();

// Require controller modules.
const message_controller = require("../controllers/messageController");
const league_controller = require("../controllers/leagueController");
const user_controller = require("../controllers/userController");
const team_controller = require("../controllers/teamController");
const player_controller = require("../controllers/playerController");
const chat_controller = require("../controllers/chatController");
const event_controller = require("../controllers/eventController");
const { protect } = require("../middleware/authMiddleware")

//Image Dependencies
const multer  = require('multer');
const crypto = require("crypto")
const {GridFsStorage} = require("multer-gridfs-storage");
const path = require('path');
//Init Multer Storage Object
const storage = new GridFsStorage({
    url: process.env.SECRET_DB_KEY,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
});
const upload = multer({ storage });





/* Homepage Routes */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
});





/* USER ROUTES */
//POST request for creating a new user
router.post("/users/create", user_controller.user_register);
 
//POST request for user login
router.post("/users/login", user_controller.user_login);

//POST request for reading user data by email
router.post("/users/read/email",  user_controller.user_read_email);

//POST request for reading user data by username
router.post("/users/read/username", user_controller.user_read_username);

//POST request to delete user data
//ADD PROTECT
router.post("/users/:id/delete", user_controller.user_delete_post);

//POST request to send password reset link
router.post("/users/forgetpass", user_controller.user_forget_post);

//POST request for reading/confirming user password for reset
router.post("/users/read/password",  user_controller.user_read_password);

//POST request for reading/confirming user password for reset
//ADD PROTECT (may be different validation methood)
//** Used to validate user's current password for reset */
router.post("/users/read/reset", user_controller.user_read_password_reset);

// POST request to reset password in db 
router.post("/users/resetpass/", user_controller.user_reset_post);

//POST request to update user data
//ADD PROTECT
router.put("/users/update/details", user_controller.user_update_details);

//POST request to update user data
//ADD PROTECT
router.put("/users/update/password", user_controller.user_update_password);

//POST request to update user data
// ** NOT NEEDED
// router.put("/user/update/preferences", user_controller.user_update_preferences);

//POST request to update user data
// ** NOT NEEDED
// router.get("/user/read/all", user_controller.user_read_all);

// //POST request to upload an image by user ID
// //PRIVATE
// router.post("/user/add/favorite", user_controller.user_add_favorite);

// //POST request to upload an image by user ID
// //PRIVATE
// router.post("/user/remove/favorite", user_controller.user_remove_favorite);

//POST request to upload an image by user ID
//PRIVATE
router.post("/user/upload/:id/:token",upload.single("profileImage"), user_controller.upload_image);

// GET request to retreive image by filename
//PUBLIC
router.get("/image/:filename", user_controller.get_image);

// //POST request to update user data
// router.put("/user/update/image", user_controller.user_update_post);

// //POST request to update user data
// router.put("/user/update/preferences", user_controller.user_update_post);





/* MESSAGE ROUTES */
// GET request for reading Messages.
router.get("/messages/read/chat", message_controller.message_read_chat);

// POST request for creating Book.
router.post("/messages/create", message_controller.message_create_post);




/* LEAGUE ROUTES */
//POST request for creating a new League collection.
//NEED TO PROTECT
router.post("/leagues/create", league_controller.league_create_new);

//GET request for reading all leagues by user
//Not needed, leagues returned with user routes
// router.get("/league/getAll",protect, league_controller.league_read_getAll);

// POST request for reading League data
router.get("/leagues/read", league_controller.league_read_getOne);

//POST request to update League data.
router.put("/leagues/update/settings", league_controller.league_update_settings);

// POST request to delete League data
router.post("/league/:id/delete", league_controller.league_delete_post);

// POST request to delete League data
router.put("/leagues/update/passcode-in", league_controller.league_update_passcode_in);

// POST request to delete League data
router.put("/leagues/update/passcode-auto", league_controller.league_update_passcode_auto);

// POST request to delete League data
router.put("/leagues/join", league_controller.league_join);



/* TEAM ROUTES */
// GET request for reading League data
router.get("/teams/read", team_controller.team_read_getOne);

// PUT request to update team settings
router.put("/teams/update", team_controller.team_update);

// PUT request to add players to the team
router.put("/teams/add/player", team_controller.team_add_player);

// PUT request to remove players from the team
router.put("/teams/drop/player", team_controller.team_remove_player);

// // PUT request to trade players between 2 teams 
// router.put("/teams/trade/player", team_controller.team_trade_player);

// // POST request to delete League data
// router.delete("/team/:id/delete", team_controller.team_delete);



/* PLAYER ROUTES */
// GET request for getting all player data
router.get("/players/all", player_controller.player_read_all);

// GET single player data
router.get("/players/id", player_controller.player_read_id);

// GET single player data
router.get("/players/world/all", player_controller.player_read_world_ranks_all);

// GET single player data
router.get("/players/fedex/all", player_controller.player_read_fedex_ranks_all);

// GET single player data
router.get("/players/leaderboard/all", player_controller.player_read_leaderboard_all);

// POST request for adding player to db by world ranks
router.put("/players/update/world", player_controller.player_update_world_ranks_all);

// POST request for adding player to db by fedex
router.put("/players/update/fedex", player_controller.player_update_fedex_all);

// POST request for adding player to db by tournament leaderboard
router.put("/players/update/leaderboard", player_controller.player_update_leaderboard_all);

// // POST request for adding player to db by tournament
// router.post("/player/add_db", player_controller.player_add_db_all);

// // GET request for reading Messages.
// router.get("/player/single/:id", player_controller.player_read_id);

// // GET request for reading Messages.
// router.post("/player/add_db", player_controller.player_add_db_all);

// // PUT request for reading Messages.
// router.put("/player/update/world_ranks", player_controller.player_update_world_ranks_all);

// // PUTrequest for reading Messages.
// router.put("/player/update/fedex", player_controller.player_update_fedex_all);



//CHAT ROUTES
//CHAT ROOM JOINING/LEAVING HANDLED IN SOCKET.IO
//CHAT MESSAGE  SENDING/RECEIVING HANDLED IN SOCKET.IO
// POST request for creating a new chat
router.post("/chats/create", chat_controller.chat_create_new);

// DELETE request for deleting 
router.delete("/chats/delete", chat_controller.chat_delete);

// GET request for reading chat messages.
router.get("/chats/get/id", chat_controller.chat_get_id);

// PUT request for adding members to chats
router.put("/chats/add/user", chat_controller.chat_add_user);

// PUT request for removing members to chats
router.put("/chats/remove/user", chat_controller.chat_remove_user);

// PUT request for updating chat settings
router.put("/chats/update", chat_controller.chat_update);



/* EVENT ROUTES */
// GET request for reading events by id
router.get("/events/read/id", event_controller.event_read_id);

// GET request for reading events by name
router.get("/events/read/name", event_controller.event_read_name);

// GET request for reading events by league id
router.get("/events/read/league", event_controller.event_read_league);

// GET request for reading events by id
router.put("/events/update/all", event_controller.event_update_all);

// GET request for reading events by id
//testing or dev purposes only 
router.put("/events/update/one", event_controller.event_update_one);








module.exports = router;
