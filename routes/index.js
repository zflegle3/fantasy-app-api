var express = require('express');
var router = express.Router();

// Require controller modules.
const message_controller = require("../controllers/messageController");
const league_controller = require("../controllers/leagueController");
const user_controller = require("../controllers/userController");
const team_controller = require("../controllers/teamController");
const player_controller = require("../controllers/playerController");
const chat_controller = require("../controllers/chatController");
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
router.post("/user/create", user_controller.user_register);
 
//POST request for user login
router.post("/user/login", user_controller.user_login);

//POST request for reading user data by email
router.post("/user/read/email",  user_controller.user_read_email);

//POST request for reading user data by username
router.post("/user/read/username", user_controller.user_read_username);

//POST request to delete user data
//ADD PROTECT
router.post("/user/:id/delete", user_controller.user_delete_post);

//POST request to send password reset link
router.post("/user/forgetpass", user_controller.user_forget_post);

//POST request for reading/confirming user password for reset
router.post("/user/read/password",  user_controller.user_read_password);

//POST request for reading/confirming user password for reset
//ADD PROTECT (may be different validation methood)
//** Used to validate user's current password for reset */
router.post("/user/read/reset", user_controller.user_read_password_reset);

// POST request to reset password in db 
router.post("/user/resetpass/", user_controller.user_reset_post);

//POST request to update user data
//ADD PROTECT
router.put("/user/update/details", user_controller.user_update_details);

// //POST request to update user data
// ** NOT NEEDED
// router.put("/user/update/password", user_controller.user_update_password);

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
router.get("/messages", message_controller.message_read_list);

// POST request for creating Book.
router.post("/messages/create", message_controller.message_create_post);






/* LEAGUE ROUTES */
//POST request for creating a new League collection.
router.post("/league/create",protect, league_controller.league_create_post);

//GET request for reading all leagues by user
router.get("/league/getAll",protect, league_controller.league_read_getAll);

// POST request for reading League data
router.post("/league/getOne",protect, league_controller.league_read_getOne);

//POST request to update League data.
router.put("/league/update/settings", league_controller.league_update_settings);

// POST request to delete League data
router.post("/league/:id/delete", league_controller.league_delete_post);

// POST request to delete League data
router.put("/league/update/passcode-in", league_controller.league_update_passcode_in);

// POST request to delete League data
router.put("/league/update/passcode-auto", league_controller.league_update_passcode_auto);

// POST request to delete League data
router.put("/league/update/team", league_controller.league_update_team);

// POST request to delete League data
router.put("/league/join", league_controller.league_join);



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
router.get("/player/all", player_controller.player_read_all);

// GET request for reading Messages.
router.get("/player/single/:id", player_controller.player_read_id);

// GET request for reading Messages.
router.post("/player/add_db", player_controller.player_add_db_all);

// PUT request for reading Messages.
router.put("/player/update/world_ranks", player_controller.player_update_world_ranks_all);

// PUTrequest for reading Messages.
router.put("/player/update/fedex", player_controller.player_update_fedex_all);

// PUTrequest for updating leaderboard
router.put("/player/update/leaderboard", player_controller.player_update_leaderboard_all);




/* Chat ROUTES */
// POST request for reading Messages.
router.post("/chat/create/new", chat_controller.chat_add_new);

// POST request for reading Messages.
// router.post("/chat/create/league", chat_controller.chat_add_new);

// POST request for reading Messages.
router.post("/chat/get/id", chat_controller.chat_get_id);

// // PUT request for reading Messages.
// router.get("/chat/update/:id", chat_controller.chat_get_id);

// // DELETE request for reading Messages.
// router.get("/chat/delete/:id", chat_controller.chat_get_id);

//CHAT ROOM JOINING/LEAVING HANDLED IN SOCKET.IO
//CHAT MESSAGE  SENDING/RECEIVING HANDLED IN SOCKET.IO




// GET request for reading Messages.
router.get("/player/single/:id", player_controller.player_read_id);

// GET request for reading Messages.
router.post("/player/add_db", player_controller.player_add_db_all);

// PUT request for reading Messages.
router.put("/player/update/world_ranks", player_controller.player_update_world_ranks_all);

// PUTrequest for reading Messages.
router.put("/player/update/fedex", player_controller.player_update_fedex_all);







module.exports = router;
