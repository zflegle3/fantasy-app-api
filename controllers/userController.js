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
    const {email, password} = req.body;
    //Check for user by email
    const user = await User.findOne({email});

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            family_name: user.family_name,
            leagues: user.leagues,
            token: generateToken(user._id),

        })
    } else {
        res.status(469).json({error: "wrong email pal"}); //change back to 400
        throw new Error("Invalid credentials")
    }
});

// @desc Read existing user data for signin
// @route POST /user/read
// @access Public
exports.user_read_get = asyncHandler(async (req, res) => {
    //read user data from db and send public data
    const {email} = req.body;
    //Check for user by email
    console.log(email);
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


  