var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { errorHandler } = require("./middleware/errorMiddleware");
const bodyParser = require('body-parser');
const { Server} = require("socket.io")
const { createServer } = require("http");
const msg_controller = require("./controllers/messageController");
const corsOptions = {
  origin: "*"
}
const cron = require('node-cron');
//import & configure dotenv
require('dotenv').config();
const { autoUpdateLeaderboard } = require("./features/data")

//Socket.io & messaging dependencies
// const http = require("http");

var indexRouter = require('./routes/index');

var app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
    }
});


// const server = app.listen(process.env.PORT, () => console.log(`server is running on PORT:${process.env.PORT}`))
// const io = require('socket.io')(server);
// const io = require('socket.io')(http.createServer(app));
// const io = socketio(server);
// const io = new Server({
//     cors: {
//       origin: "http://localhost:3000",
//       methods: ["GET", "POST"],
//     }
// });
// io.listen(4000);

// Set up mongoose connection
const mongoose = require("mongoose");
const mongoDB = process.env.SECRET_DB_KEY;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));


//socket io connection
io.on("connection", socket => {
    console.log("new connection")

    //join room
    socket.on("join_room", (username, room) => {
        //join room
        socket.join(room);
        //broadcast to single client
        socket.emit("message", `welcome to chatroom: ${room}`)

        //Broadcast when new user joins
        socket.broadcast.emit("message", `${username} has joined the chat`);
    })

    //User sends message
    socket.on("send_message", (data) => {
        console.log(data);
        //save message to backend
            //call to db**
        msg_controller.msg_add_new(data)
        //send message back to users
        socket.emit("receive_message", data);
    })

    //Runs on Disconnect
    socket.on("disconnect", () => {
        console.log("user has disconnected");
        socket.emit("message", "a user has left the chatroom")
    })
})

io.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
});




// view engine setup 
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "pug");

app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(errorHandler);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});

// cron.schedule('*/5 * * * *', async () => {
// // cron.schedule('1 */6 * * *', async () => {
//     //scheduled for 1 min past every 6th hr;
//     console.log("Calling scheduled function at:",new Date());
//     autoUpdateLeaderboard(process.env.ADMIN_PASSWORD);
// });


// app.listen(process.env.PORT, () => console.log(`server is running on PORT:${process.env.PORT}`))
// io.listen(8000);
httpServer.listen(process.env.PORT || 80);


module.exports = app;
