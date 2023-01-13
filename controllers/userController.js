const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");


// @desc Register new user
// @route POST /user/create
// @access Public
exports.user_register = asyncHandler(async (req, res) => {
    //create new user data
    const {username, email, password, first_name, family_name } = req.body;

    if (!username || !email || !password) {
        res.status(400);
        throw new Error("Please add all fields");
    }

    //check user exists
    const userExists = await User.findOne({email});
    if (userExists) {
        //error bc user exists
        res.status(400);
        throw new Error("User already exists");
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    //create user
    const user = await User.create({
        username: username,
        password: hashedPass,
        email: email,
        first_name: first_name,
        family_name: family_name,
        leagues: [],
    })

    if (user) {
        res.status(201).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            family_name: user.family_name,
            leagues: user.leagues,
        })
    } else {
        res.status(400)
        throw new Error("Invalid data, user not created")
    }


    res.json("NOT IMPLEMENTED: Create new user");
});

// @desc Authenticate user login
// @route POST /user/login
// @access Private
exports.user_login = async (req, res) => {
    //read user data from db and send
    res.send("NOT IMPLEMENTED: Login User");
};

// @desc Read existing user data
// @route POST /user/:id
// @access Private
exports.user_read_get = async (req, res) => {
    //read user data from db and send
    res.send("NOT IMPLEMENTED: User read data, GET");
};


// @desc Update existing user
// @route POST /user/"id/update
// @access Private
exports.user_update_post = async (req, res) => {
    //update existing user data
    res.send("NOT IMPLEMENTED: User update data, POST");
};


// @desc Delete existing user 
// @route POST /user/"id/delete
// @access Private
exports.user_delete_post = async (req, res) => {
    //delete existing user data
    res.send("NOT IMPLEMENTED: User delete POST");
};