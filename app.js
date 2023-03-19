var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { errorHandler } = require("./middleware/errorMiddleware");
const bodyParser = require('body-parser');

//import & configure dotenv
require('dotenv').config();

var indexRouter = require('./routes/index');

var app = express();

// Set up mongoose connection
const mongoose = require("mongoose");
const mongoDB = process.env.SECRET_DB_KEY;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// view engine setup 
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "pug");
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(errorHandler);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

module.exports = app;
