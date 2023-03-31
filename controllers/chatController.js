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


const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "30d"})
}

const generateResetToken = (user, userSecret) => {
    return jwt.sign({user}, userSecret, {expiresIn: "30m"})
}


// @desc Register new user
// @route POST /chat/create
// @access Private
exports.chat_add_new = asyncHandler(async (req, res) => {
    //Pull new chat data
    const {userId, username, name } = req.body;
    console.log(userId, username, name);

    if (!userId || !name || !username) {
        res.status(400);
        throw new Error("Please add all fields");
    }

    //create new chat object 
    const dt = new Date();
    const newChat = await Chat.create({
        name: name,
        refId: uuidv4(),
        members: [username],
        messages: [{username: username, time: dt, msg: "League Created"}],
    })

    if (newChat) {
        // res.status(201).json({
        //     name: name,
        //     refID: uuidv4(),
        //     users: [username],
        //     messages: [{username: username, time: new Date.now(), msg: "League Created"}],
        // })
    } else {
        res.status(400)
        throw new Error("Invalid data, chat not created")
    }

    //Add chat to user's db doc
    //Check for user
    let user = await User.findOne({_id: userId})
    if (!user) {
        res.status(401)
        throw new Error("User not found");
    } 
    let chatsNew = user.chats;

    //add favorite data
    chatsNew.push(newChat._id);
    //Updates user and returns updarted user details
    const updatedUser = await User.findByIdAndUpdate(userId, {chats: chatsNew}, { new: true });

    if (updatedUser) {
        res.json({
            _id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            first_name: updatedUser.first_name,
            family_name: updatedUser.family_name,
            favorites: updatedUser.favorites,
            leagues: updatedUser.leagues,
            chats: [chatsNew],
            color: updatedUser.color,
            profileImage: updatedUser.profileImage,
            token: generateToken(updatedUser._id),
        });
        res.status(200)
    } else {
        res.status(400)
        throw new Error("Invalid data, user not updated with new chat")
    }

});