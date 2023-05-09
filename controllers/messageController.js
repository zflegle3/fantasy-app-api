const Message = require("../models/message");
const User = require("../models/user");
const Chat = require("../models/chat")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
var nodemailer = require('nodemailer');
const { update } = require("../models/message");
const mongoose = require('mongoose');
const db = mongoose.connection;
const { executeChallenge } = require("../features/data");
const { v4: uuidv4 } = require('uuid');
const database = require("../database/databaseActions");

// @desc Register new user
// @route POST /message/create
// @access Private
// exports.msg_add_new = asyncHandler(async (data) => {
//   //from socket.io emit send_message
//   console.log(data);

//   if (!data) {
//       res.status(400);
//       throw new Error("Please add all fields");
//   }

//   //create new chat object 
//   const newMsg = {
//       id: data.id,
//       username: data.username,
//       time: data.time,
//       msg: data.msg,
//   }

//   console.log(newMsg);

//   //find current chat and pull 
//   let chat = await Chat.findOne({_id: data.chatId})
//   if (!chat) {
//       res.status(401)
//       throw new Error("User not found");
//   } 
//   let messagesNew = chat.messages;
//   //add favorite data
//   messagesNew.push(newMsg);
//   //Updates user and returns updarted user details
//   const updatedChat = await Chat.findByIdAndUpdate(data.chatId, {messages: messagesNew}, { new: true });

//   // if (updatedUser) {
//   //     // res.json({
//   //     //     _id: updatedUser.id,
//   //     //     username: updatedUser.username,
//   //     //     email: updatedUser.email,
//   //     //     first_name: updatedUser.first_name,
//   //     //     family_name: updatedUser.family_name,
//   //     //     favorites: updatedUser.favorites,
//   //     //     leagues: updatedUser.leagues,
//   //     //     chats: [messagesNew],
//   //     //     color: updatedUser.color,
//   //     //     profileImage: updatedUser.profileImage,
//   //     //     token: generateToken(updatedUser._id),
//   //     // });
//   //     res.status(200)
//   // } else {
//   //     res.status(400)
//   //     throw new Error("Invalid data, user not updated with new chat")
//   // }
// });





// Display list of recent Messages
exports.message_read_list = async (req, res) => {
  const {chat_id} = req.body;
  //read list of latest messages
  // const messages = await Message.find()
  const messages = await database.getMessagesByChatId(chat_id);
  // res.send("NOT IMPLEMENTED: Messages list");
  if (messages.length >0) {
    res.status(200).json({messages: messages, status: "Messages found"});
  } else {
    res.status(400).json({messages: null, status: "Unable to retrieve messages"});
  }

};

// Handle Message create on POST.
exports.message_create_post = async (req, res) => {
  const {chat_id, user_id, body} = req.body;
  console.log(chat_id, user_id, body)
  //create new message
  if (!chat_id || !user_id || !body) {
    res.status(400)
    throw new Error("Please add text to the message")
  }

  // const messageNew = await Message.create({
  //   content: req.body.text
  // })
  const messageNew = await database.createNewMessage(chat_id, user_id, body);

  // res.send("NOT IMPLEMENTED: Messages create POST");
  if (messageNew) {
    res.status(200).json({status: "message sent"});
  } else {
    res.status(401).json({status: "unable to send message"});
  }

};




// Display detail page for a specific Author.
// exports.author_detail = (req, res) => {
//   res.send(`NOT IMPLEMENTED: Author detail: ${req.params.id}`);
// };

// Display Author create form on GET.
// exports.author_create_get = (req, res) => {
//   res.send("NOT IMPLEMENTED: Author create GET");
// };

// Handle Author create on POST.
// exports.author_create_post = (req, res) => {
//   res.send("NOT IMPLEMENTED: Author create POST");
// };

// Display Author delete form on GET.
// exports.author_delete_get = (req, res) => {
//   res.send("NOT IMPLEMENTED: Author delete GET");
// };

// Handle Author delete on POST.
// exports.author_delete_post = (req, res) => {
//   res.send("NOT IMPLEMENTED: Author delete POST");
// };

// Display Author update form on GET.
// exports.author_update_get = (req, res) => {
//   res.send("NOT IMPLEMENTED: Author update GET");
// };

// Handle Author update on POST.
// exports.author_update_post = (req, res) => {
//   res.send("NOT IMPLEMENTED: Author update POST");
// };