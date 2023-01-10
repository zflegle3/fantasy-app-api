var express = require('express');
var router = express.Router();

// Require controller modules.
const message_controller = require("../controllers/messageController");
const league_controller = require("../controllers/leagueController");
// const user_controller = require("../controllers/userController");
// const team_controller = require("../controllers/teamController");
// const player_controller = require("../controllers/playerController");


/* Homepage Routes */

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


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


module.exports = router;
