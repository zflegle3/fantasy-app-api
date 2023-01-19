const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "30d"})
}

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
            token: generateToken(user._id),
        })
    } else {
        res.status(400)
        throw new Error("Invalid data, user not created")
    }
});



// @desc Authenticate user login
// @route POST /user/login
// @access Private
exports.user_login = asyncHandler(async (req, res) => {
    //read user data from db and send
    const {emailOrUsername, password} = req.body;
    //Check for user by email and username
    const userEmail = await User.findOne({email: emailOrUsername});
    const userUsername = await User.findOne({username: emailOrUsername});

    if (userEmail && (await bcrypt.compare(password, userEmail.password))) {
        res.json({
            _id: userEmail.id,
            username: userEmail.username,
            email: userEmail.email,
            first_name: userEmail.first_name,
            family_name: userEmail.family_name,
            leagues: userEmail.leagues,
            token: generateToken(userEmail._id),
        })
    } else if (userUsername && (await bcrypt.compare(password, userUsername.password))) {
        res.json({
            _id: userUsername.id,
            username: userUsername.username,
            email: userUsername.email,
            first_name: userUsername.first_name,
            family_name: userUsername.family_name,
            leagues: userUsername.leagues,
            token: generateToken(userUsername._id),
        })
    } else {
        res.status(400).json({error: "wrong email pal"}); //change back to 400
        throw new Error("Invalid credentials")
    }
});

// @desc Verify exsiting email for signup/login
// @route POST /user/read
// @access Public
exports.user_read_email = asyncHandler(async (req, res) => {
    //read user data from db and send public data
    const {email} = req.body;
    //Check for user by email
    const user = await User.findOne({email});
    if (user) {
        res.json({
            _id: user.id,
            username: user.username,
            email: user.email,
        })
    } else {
        res.json({
            _id: "not valid user",
            username: "not valid user",
            email: "not valid user",
        })
    }

    res.status(200).json(req.user)
});

// @desc Verify exsiting username for signup
// @route POST /user/read/username
// @access Public
exports.user_read_username = asyncHandler(async (req, res) => {
    //read user data from db and send public data
    const {username} = req.body;
    //Check for user by email
    const user = await User.findOne({username});
    if (user) {
        res.json({
            _id: user.id,
            username: user.username,
            email: user.email,
        })
    } else {
        res.json({
            _id: "not valid user",
            username: "not valid user",
            email: "not valid user",
        })
    }
    res.status(200).json(req.user)
});


// @desc Update existing user
// @route POST /user/"id/update
// @access Private
exports.user_update_post = asyncHandler(async (req, res) => {
    //update existing user data
    res.send("NOT IMPLEMENTED: User update data, POST");
});


// @desc Delete existing user 
// @route POST /user/"id/delete
// @access Private
exports.user_delete_post = asyncHandler(async (req, res) => {
    //delete existing user data
    res.send("NOT IMPLEMENTED: User delete POST");
});


  