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


const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "30d"})
}

const generateResetToken = (user, userSecret) => {
    return jwt.sign({user}, userSecret, {expiresIn: "30m"})
}


// @desc Create a new user chat
// @route POST /chats/create/new
// @access Private
exports.chat_create_new = asyncHandler(async (req, res) => {
    //Pull new chat data
    const {user_id, name} = req.body;
    //check for valid inputs
    if (!user_id || !name) {
        res.status(400).json({status: "Error: please add all fields"})
    }
    //confirm user exists and create variable for return values
    let userFound = await database.getUserById(user_id);
    if (!userFound) {
        res.status(401).json({status: "Error: user not found"})
    } 
    //Create new chat and return Id
    const newChatId = await database.createNewChat(name);
    if (!newChatId) {
        res.status(400).json({status: "Error: unable to create chat"})
    }
    //add user chat relationship
    const userChatNew = await database.userAddChat(newChatId, userFound.id);
    //return user with updated chats 
    let userChats = await database.getUserChatsByUserId(userFound.id)
    let userLeagues = await database.getUserLeaguesByUserId(userFound.id)
    if (newChatId) {
        res.status(200).json( {
            user: {
                id: userFound.id,
                username: userFound.username,
                email: userFound.email,
                first_name: userFound.first_name,
                last_name: userFound.last_name,
                chats: userChats,
                leagues: userLeagues,
                token: generateToken(userFound.id),
            },
            status: "chat created"
        });
    } else {
        res.status(400).json( {
            user: {
                id: userFound.id,
                username: userFound.username,
                email: userFound.email,
                first_name: userFound.first_name,
                last_name: userFound.last_name,
                chats: userChats,
                leagues: userLeagues,
                token: generateToken(userFound.id),
            },
            status: "Invalid data, chat not created"
        });
    }
});

// @desc Delete an existing chat 
// @route DELETE /chats/delete
// @access Private
exports.chat_delete = asyncHandler(async (req, res) => {
    //Pull new chat data
    const {id} = req.body;
    //check for valid inputs
    let chatFound = await database.getChat(id);
    if (!chatFound) {
        res.status(400).json({status: "Error: unable to find chat"})
    }
    //get existing chat members
    let members = await database.getChatUsers(id);
    if (members.length > 0) {
        for(let i=0; i< members.length; i++) {
            database.userRemoveChat(members[i].user_id, id);
        };
    };
    //delete chat
    let deleteChat = await database.deleteChat(id)
    //delete chat user relationships
    if (deleteChat) {
        res.status(200).json({
            status: "chat deleted"
        });
    } else {
        res.status(400).json({
            status: "unable to delete chat"
        });
    };
});




// @desc Register new user
// @route GET /chats/get/id
// @access Private
exports.chat_get_id = asyncHandler(async (req, res) => {
    //Pull new chat data
    const {id} = req.body;
    if (!id) {
        res.status(400).json({chat: null, status: "Error: provide chat id"})
    }

    //Add chat to user's db doc
    //Check for user
    // let chat = await Chat.findOne({_id: chatId})
    let chat = await database.getChat(id);
    let members = await database.getChatUsers(id);
    let messages = await database.getMessagesByChatId(id);
    console.log(chat);
    if (chat) {
        res.status(200).json({
            chat: {
                id: chat.id,
                name: chat.name,
                members: members,
                messages: messages,
            },
            status: "chat found"
        });
    } else {
        res.status(400).json({
            chat: {
                id: chat.id,
                name: chat.name,
                members: members,
                messages: messages,
            },
            status: "Invalid data, chat data not found"
        });
    }

});

// @desc Add members to chat 
// @route PUT /chats/add/user
// @access Private
exports.chat_add_user = asyncHandler(async (req, res) => {
    const {chat_id, user_id} = req.body;
    if (!chat_id || ! user_id) {
        res.status(400).json({chat: null, status: "Error: provide chat parameters"})
    }
    //add chat user relationship
    let userChatAdd = database.userAddChat(chat_id, user_id);
    //return chat with updated users
    let chat = await database.getChat(chat_id);
    let members = await database.getChatUsers(chat_id);
    let messages = await database.getMessagesByChatId(chat_id);
    if (userChatAdd) {
        res.status(200).json({
            chat: {
                id: chat.id,
                name: chat.name,
                members: members,
                messages: messages,
            },
            status: "chat found"
        });
    } else {
        res.status(400).json({
            chat: {
                id: chat.id,
                name: chat.name,
                members: members,
                messages: messages,
            },
            status: "Invalid data, chat data not found"
        });
    }
});

// @desc Remove members from chat 
// @route PUT /chats/remove/user
// @access Private
exports.chat_remove_user = asyncHandler(async (req, res) => {
    const {chat_id, user_id} = req.body;
    if (!chat_id || ! user_id) {
        res.status(400).json({chat: null, status: "Error: provide chat parameters"})
    }
    //add chat user relationship
    let userChatRemove = database.userRemoveChat(user_id, chat_id);
    //return chat with updated users
    let chat = await database.getChat(chat_id);
    let members = await database.getChatUsers(chat_id);
    let messages = await database.getMessagesByChatId(chat_id);
    if (userChatRemove) {
        res.status(200).json({
            chat: {
                id: chat.id,
                name: chat.name,
                members: members,
                messages: messages,
            },
            status: "chat found"
        });
    } else {
        res.status(400).json({
            chat: {
                id: chat.id,
                name: chat.name,
                members: members,
                messages: messages,
            },
            status: "Invalid data, chat data not found"
        });
    }
});


// @desc Update Chat Settings
// @route PUT /chats/update
// @access Private
exports.chat_update = asyncHandler(async (req, res) => {
    const {id, name} = req.body;
    if (!id || !name) {
        res.status(400).json({chat: null, status: "Error: provide chat parameters"})
    }
    //update chat with new name
    let updatedChat = database.updateChat(id, name);
    //return chat with updated users
    let chat = await database.getChat(id);
    let members = await database.getChatUsers(id);
    let messages = await database.getMessagesByChatId(id);
    if (updatedChat) {
        res.status(200).json({
            chat: {
                id: chat.id,
                name: chat.name,
                members: members,
                messages: messages,
            },
            status: "chat found"
        });
    } else {
        res.status(400).json({
            chat: {
                id: chat.id,
                name: chat.name,
                members: members,
                messages: messages,
            },
            status: "Invalid data, chat data not found"
        });
    }
});








// // @desc Register new user
// // @route POST /chat/create/league
// // @access Private
// exports.chat_add_league = asyncHandler(async (req, res) => {
//     //Pull new chat data
//     const {leagueId, userId, username, name } = req.body;
//     console.log(userId, username, name);

//     if (!userId || !name || !username) {
//         res.status(400);
//         throw new Error("Please add all fields");
//     }

//     //create new chat object 
//     const dt = new Date();
//     const newChat = await Chat.create({
//         name: name,
//         refId: uuidv4(),
//         members: [username],
//         messages: [{username: username, time: dt, msg: "League Created"}],
//     })

//     if (newChat) {
//         // res.status(201).json({
//         //     name: name,
//         //     refID: uuidv4(),
//         //     users: [username],
//         //     messages: [{username: username, time: new Date.now(), msg: "League Created"}],
//         // })
//     } else {
//         res.status(400)
//         throw new Error("Invalid data, chat not created")
//     }

//     //Add chat to user's db doc
//     //Check for user
//     let user = await User.findOne({_id: userId})
//     if (!user) {
//         res.status(401)
//         throw new Error("User not found");
//     } 
//     let chatsNew = user.chats;

//     //add favorite data
//     chatsNew.push(newChat._id);
//     //Updates user and returns updarted user details
//     const updatedUser = await User.findByIdAndUpdate(userId, {chats: chatsNew}, { new: true });

//     if (updatedUser) {
//         res.json({
//             _id: updatedUser.id,
//             username: updatedUser.username,
//             email: updatedUser.email,
//             first_name: updatedUser.first_name,
//             family_name: updatedUser.family_name,
//             favorites: updatedUser.favorites,
//             leagues: updatedUser.leagues,
//             chats: [chatsNew],
//             color: updatedUser.color,
//             profileImage: updatedUser.profileImage,
//             token: generateToken(updatedUser._id),
//         });
//         res.status(200)
//     } else {
//         res.status(400)
//         throw new Error("Invalid data, user not updated with new chat")
//     }

// });