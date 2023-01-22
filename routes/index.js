var express = require('express');
var router = express.Router();

// Require controller modules.
const message_controller = require("../controllers/messageController");
const league_controller = require("../controllers/leagueController");
const user_controller = require("../controllers/userController");
const team_controller = require("../controllers/teamController");
const player_controller = require("../controllers/playerController");
const { protect } = require("../middleware/authMiddleware")



/* Homepage Routes */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
});



/* USER ROUTES */
//POST request for creating a new user
router.post("/user/create", user_controller.user_register);
 
//POST request for user login
router.post("/user/login", user_controller.user_login);

//POST request for reading user data
router.post("/user/read/email",  user_controller.user_read_email);

//POST request for reading user data
router.post("/user/read/username",  user_controller.user_read_username);

// // GET request for reading user data
// router.get("/user/read", protect, user_controller.user_read_get); //format of how to protect routes

//POST request to update user data
router.post("/user/:id/update", user_controller.user_update_post);

// POST request to delete user data
router.post("/user/:id/delete", user_controller.user_delete_post);

// POST request to send password reset link
router.post("/user/forgetpass", user_controller.user_forget_post);

//POST request for reading/confirming user password for reset
router.post("/user/read/password",  user_controller.user_read_password);

// POST request to reset password in db 
router.post("/user/resetpass/", user_controller.user_reset_post);



/* MESSAGE ROUTES */
// GET request for reading Messages.
router.get("/messages", message_controller.message_read_list);

// POST request for creating Book.
router.post("/message/create", message_controller.message_create_post);


/* LEAGUE ROUTES */
// GET request for reading League data
router.get("/league/:id", league_controller.league_read_get);

//POST request for creating a new League collection.
router.post("/league/create", league_controller.league_create_post);

//POST request to update League data.
router.post("/league/:id/update", league_controller.league_update_post);

// POST request to delete League data
router.post("/league/:id/delete", league_controller.league_delete_post);



/* TEAM ROUTES */
// GET request for reading League data
router.get("/team/:id", team_controller.team_read_get);

//POST request for creating a new League collection.
router.post("/team/create", team_controller.team_create_post);

//POST request to update League data.
router.post("/team/:id/update", team_controller.team_update_post);

// POST request to delete League data
router.post("/team/:id/delete", team_controller.team_delete_post);



/* PLAYER ROUTES */
// GET request for reading Messages.
router.get("/player/:id", player_controller.player_read_get);






module.exports = router;
