// const Message = require("../models/message");
// const User = require("../models/user");
// const Chat = require("../models/chat")
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const asyncHandler = require("express-async-handler");
// const { update } = require("../models/message");
// const mongoose = require('mongoose');
// const db = mongoose.connection;
const database = require("../database/databaseActions");

// @desc Read recent chat messages
// @route GET /messages/read/chat
// @access Private 
exports.message_read_chat = async (req, res) => {
  const {chat_id} = req.body;
  //read list of latest messages (last 10 per query)
  const messages = await database.getMessagesByChatId(chat_id);
  // res.send("NOT IMPLEMENTED: Messages list");
  if (messages.length >0) {
    res.status(200).json({messages: messages, status: "Messages found"});
  } else {
    res.status(400).json({messages: null, status: "Unable to retrieve messages"});
  }

};

// @desc Create a new message
// @route POST /messages/create
// @access Private 
exports.message_create_post = async (req, res) => {
  const {chat_id, user_id, body} = req.body;
  console.log(chat_id, user_id, body)
  //create new message
  if (!chat_id || !user_id || !body) {
    res.status(400)
    throw new Error("Please add text to the message")
  }
  const messageNew = await database.createNewMessage(chat_id, user_id, body);
  if (messageNew) {
    res.status(200).json({status: "message sent"});
  } else {
    res.status(401).json({status: "unable to send message"});
  }
};
