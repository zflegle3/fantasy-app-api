const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
var nodemailer = require('nodemailer');

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "30d"})
}

const generateResetToken = (user, userSecret) => {
    return jwt.sign({user}, userSecret, {expiresIn: "30m"})
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
        // throw new Error("Invalid credentials")
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


// @desc Validate email and send password reset link
// @route POST /user/forgetpass
// @access Public
exports.user_forget_post = asyncHandler(async (req, res) => {
    //send reset link to user email
    const {email} = req.body;
    const user = await User.findOne({email});
    if (user) {
        //create token for link
        const userSecret = process.env.JWT_SECRET + user.password;
        const payload = {
            id: user._id,
            email: user.email
        }
        //create one time link valid for XX min
        let resetToken = generateResetToken(payload,userSecret);
        const link = `http://localhost:3000/reset/${user.email}/${user._id}/${resetToken}`
        //send email to user
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.RESET_EMAIL,
              pass: process.env.RESET_EMAIL_PASS
            }
        });

        var mailOptions = {
            from: process.env.RESET_EMAIL,
            to: email,
            subject: 'Reset Password Link - Fantasy Golf App',
            text: `Please use the following link to reset your password: ${link}`
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

          res.json({ 
            sendStatus: true,
        })

    } else {
        res.json({ 
            sendStatus: false,
        })
        res.status(400).json("No user registered with provided email")
    }
});

// @desc Confirm password for reset
// @route POST /user/read/password
// @access Public
exports.user_read_password = asyncHandler(async (req, res) => {
    //read user data from db and send public data
    const {id, password} = req.body;
    //Check for user by email
    const user = await User.findOne({_id: id});

    if (!user) {
        res.status(401).json("Invalid id");
    }

    if ((await bcrypt.compare(password, user.password))) {
        //returns false for matching and true for not matching 
        res.json({ 
            passMatch: false,
        })
    } else {
        res.json({ 
            passMatch: true,
        })
    }
    res.status(200).json(req.user)
});

// @desc validate and update new password
// @route POST /user/resetpass
// @access Public
exports.user_reset_post = asyncHandler(async (req, res) => {
    //get params from body
    const {id, token, password} = req.body;
    //find user by id
    const user = await User.findOne({_id: id});
    if (!user) {
        res.status(401).json("Invalid user");
    }
    //validate jwt token
    const secret = process.env.JWT_SECRET + user.password;
    try {
        const payload = jwt.verify(token, secret);
        //encrypt password
        const salt = await bcrypt.genSalt(10);
        const hashedPassNew = await bcrypt.hash(password, salt);
        //update user password
        const updatedUser = await User.findByIdAndUpdate(id, {password: hashedPassNew});
        res.json({ 
            updateStatus: true,
        })
        res.status(200)
    } catch (err) {
        res.json({ 
            updateStatus: false,
            error: err
        })
        res.status(400)
    }





    res.send(user);
});









  