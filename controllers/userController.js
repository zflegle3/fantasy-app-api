const User = require("../models/user");
// const Player = require("../models/player")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
var nodemailer = require('nodemailer');
const { update } = require("../models/message");
const mongoose = require('mongoose');
const db = mongoose.connection;
const { executeChallenge } = require("../features/data");
const database = require("../database/databaseActions");



//Init GridFs Stream
let gfs;
db.once('open', () => {;
    gfs = new mongoose.mongo.GridFSBucket(db, {bucketName: 'uploads'});
})

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "30d"})
}

const generateResetToken = (user, userSecret) => {
    return jwt.sign({user}, userSecret, {expiresIn: "30m"})
}



// @desc Register a new user
// @route POST /user/create
// @access Public
exports.user_register = asyncHandler(async (req, res) => {
    //create new user data
    const {username, email, password, first_name, family_name } = req.body;
    //confirm login credentials exist
    if (!username || !email || !password) {
        res.status(400);
        res.send({status: "Error: Please add all fields"})
    }
    const userExists = await database.getUserByEmail(email);
    if (userExists) {
        //error bc user exists
        res.status(401);
        res.send({status: "Error: User already exists", user: null})
    }
    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);
    //create new user
    const userNew = await database.createNewUser('First Name', 'Last Name', username, hashedPass, email)
    let userFound = await database.getUserByUsername(username);
    if (userFound) {
        res.status(201).json({
            user: {
                id: userFound.id,
                username: userFound.username,
                email: userFound.email,
                first_name: userFound.first_name,
                last_name: userFound.last_name,
                chats: [],
                leagues: [],
                token: generateToken(userFound.id),
            },
            status: "User created" 
        })
    } else {
        res.status(400)
        res.send({status: "Error: User could not be created", user: null})
    }
});



// @desc Authenticate user login
// @route POST /users/login
// @access Public
exports.user_login = asyncHandler(async (req, res) => {
    //read user data from db and send
    const {emailOrUsername, password} = req.body;
    console.log("Inputs:",emailOrUsername, password);
    //Check for user by email and username
    const userEmail = await database.getUserByEmail(emailOrUsername);
    const userUsername = await database.getUserByUsername(emailOrUsername);

    console.log(userEmail, userUsername);
    console.log("passcheck", await bcrypt.compare(password, userEmail.password));
    if (userEmail && (await bcrypt.compare(password, userEmail.password))) {
        let userChats = await database.getUserChatsByUserId(userEmail.id)
        let userLeagues = await database.getUserLeaguesByUserId(userEmail.id)
        res.json({
            user: {
                id: userEmail.id,
                username: userEmail.username,
                email: userEmail.email,
                first_name: userEmail.first_name,
                last_name: userEmail.last_name,
                chats: userChats,
                leagues: userLeagues,
                token: generateToken(userEmail.id)
            },
            status: "user found"
        });
    } else if (userUsername && (await bcrypt.compare(password, userUsername.password))) {
        let userChats = await database.getUserChatsByUserId(userUsername.id)
        let userLeagues = await database.getUserLeaguesByUserId(userUsername.id)
        res.json({
            user: {
                id: userUsername.id,
                username: userUsername.username,
                email: userUsername.email,
                first_name: userUsername.first_name,
                last_name: userUsername.last_name,
                chats: userChats,
                leagues: userLeagues,
                token: generateToken(userUsername.id),
            },
            status: "user found"
        });
    } else {
        res.status(401).json({user: null, status: "Error: wrong login credentials pal"});
    }
});


// @desc Verify exisiting email for signup/login
// @route POST /user/read
// @access Public
exports.user_read_email = asyncHandler(async (req, res) => {
    //read user data from db and send public data
    const {email} = req.body;
    console.log(email);
    //Check for user by email
    const user = await database.getUserByEmail(email)
    if (user) {
        res.status(200)
        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
        })
    } else {
        res.status(200)
        res.json({
            id: "invalid user",
            username: "invalid user",
            email: "invalid user",
        })
    }
});

// @desc Verify exsiting username for signup
// @route POST /user/read/username
// @access Public
exports.user_read_username = asyncHandler(async (req, res) => {
    //read user data from db and send public data
    const {username} = req.body;
    //Check for user by email
    const user = await database.getUserByUsername(username);
    if (user) {
        res.status(200)
        res.json({
            _id: user.id,
            username: user.username,
            email: user.email,
        })
    } else {
        res.status(200)
        res.json({
            _id: "invalid user",
            username: "invalid user",
            email: "invalid user",
        })
    }
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
    // const user = await User.findOne({email});
    const user = await database.getUserByEmail(email)
    if (user) {
        //create token for link
        const userSecret = process.env.JWT_SECRET + user.password;
        const payload = {
            id: user._id,
            email: user.email
        }
        //create one time link valid for XX min
        let resetToken = generateResetToken(payload,userSecret);
        const link = `https://zflegle3.github.io/fantasy-golf-app/#/reset/${user.email}/${user._id}/${resetToken}`
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

// @desc Confirm password for change password form
// @route POST /user/read/password
// @access Private
exports.user_read_password = asyncHandler(async (req, res) => {
    //read user data from db and send public data
    const {id, password} = req.body;
    //Check for user by email
    // const user = await User.findOne({_id: id});
    const user = await database.getUserById(id);
    if (!user) {
        res.status(401).json({passMatch: "Invalid id"});
    }
    //validate jwt token
    //Validates if new password matches old password
    //Cannot reset password with previous password
    if (await bcrypt.compare(password, user.password)) {
        //returns false for matching and true for not matching 
        res.json({ 
            passMatch: false,
        });
        res.status(200);
    } else {
        res.json({ 
            passMatch: true,
        });
        res.status(200);
    }
});

// @desc Confirm password for reset
// @route POST /user/read/password/reset
// @access Public
exports.user_read_password_reset = asyncHandler(async (req, res) => {
    //read user data from db and send public data
    const {id, password, token} = req.body;
    //Check for user by email
    // const user = await User.findOne({_id: id});
    const user = await database.getUserById(id);
    if (!user) {
        res.status(401).json("Invalid id");
    }
    //validate jwt token
    const secret = process.env.JWT_SECRET + user.password;
    try {
        const passCheck = jwt.verify(token, secret);
        //Validates if new password matches old password
        //Cannot reset password with previous password
        if (await bcrypt.compare(password, user.password)) {
            //returns false for matching and true for not matching 
            res.json({ 
                passMatch: false,
            });
            res.status(200);
        } else {
            res.json({ 
                passMatch: true,
            });
            res.status(200);
        }
    } catch (err) {
        res.json({ 
            passMatch: false,
            error: err
        });
        res.status(400);
    }
});

// @desc validate and update new password
// @route POST /user/resetpass
// @access Public
exports.user_reset_post = asyncHandler(async (req, res) => {
    //get params from body
    const {id, token, password} = req.body;
    //find user by id
    // const user = await User.findOne({_id: id});
    const user = await database.getUserById(id);
    if (!user) {
        res.status(401).json({updateStatus: false, error: "Invalid user"});
    }
    //validate jwt token
    const secret = process.env.JWT_SECRET + user.password;
    try {
        const payload = jwt.verify(token, secret);
        //encrypt password
        const salt = await bcrypt.genSalt(10);
        const hashedPassNew = await bcrypt.hash(password, salt);
        //update user password
        // const updatedUser = await User.findByIdAndUpdate(id, {password: hashedPassNew});
        const updatedUser = await database.updateUser(id, null, null, null, password, null)
        res.json({ 
            updateStatus: true,
            error: null,
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



// @desc Update existing user
// @route PUT /user/update/details
// @access Private (**NEED TO PROTECT)
exports.user_update_details = asyncHandler(async (req, res) => {
    const {id, first_name, last_name, username, password, email} = req.body;
    //check if user exists
    // const userCheck = mongoose.Types.ObjectId.isValid(id);
    const userCheck = await database.getUserById(id);
    if (!userCheck) {
        res.status(401)
        throw new Error("User not found");
    }
    //hash password if being updated
    let hashedPassword = null;
    if (password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
    }
    const updatedUser = await database.updateUser(id, first_name, last_name, username, hashedPassword, email);
    const userFound = await database.getUserById(id);
    let userChats = await database.getUserChatsByUserId(userFound.id)
    let userLeagues = await database.getUserLeaguesByUserId(userFound.id)
    if (updatedUser) {
        res.json({
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
            status: "user updated successfully"
        });
        res.status(200);
    } else {
        res.json({user: null, status: "Unable to update user"})
        res.status(401)
    };
});

// // @desc Update existing user password
// // @route POST /user/update/password
// // @access Private
// // **NOT NEEDED
// exports.user_update_password = asyncHandler(async (req, res) => {
//     const {id, password} = req.body;
//     //check if user exists
//     const userCheck = mongoose.Types.ObjectId.isValid(id);
//     if (!userCheck) {
//         res.status(401)
//         throw new Error("User not found");
//     }
//     let update = {};
//     //if a password is passed in (null otherwise) create new hashed password
//     if (password) {
//         //hash password & add to userUpdated
//         const salt = await bcrypt.genSalt(10);
//         const hashedPass = await bcrypt.hash(password, salt);
//         update.password = hashedPass;
//     }

//     const updatedUser = await User.findByIdAndUpdate(id, update, {new: true});
//     if (!updatedUser) {
//         res.status(401)
//         throw new Error("User not found");
//     } else {
//         res.json({
//             _id: updatedUser.id,
//             username: updatedUser.username,
//             email: updatedUser.email,
//             first_name: updatedUser.first_name,
//             family_name: updatedUser.family_name,
//             favorites: updatedUser.favorites,
//             leagues: updatedUser.leagues,
//             chats: [],
//             color: updatedUser.color,
//             profileImage: updatedUser.profileImage,
//             token: generateToken(updatedUser._id),
//         });
//         res.status(200);
//     }
// });


// // @desc Update existing user
// // @route PUT /user/update/preferences
// // @access Private
// exports.user_update_preferences = asyncHandler(async (req, res) => {
//     const {id, color, favorites} = req.body;
//     //check if user exists
//     const userCheck = mongoose.Types.ObjectId.isValid(id);
//     if (!userCheck) {
//         res.status(401)
//         throw new Error("User not found");
//     }

//     //update existing user data
//     let update = {};
//     if (color) {
//         update.color = color;
//     };
//     if (favorites) {
//         update.favorites = favorites;
//     }
//     const updatedUser = await User.findByIdAndUpdate(id, update, {new: true});

//     if (!updatedUser) {
//         res.status(401)
//         throw new Error("User not found");
//     } else {
//         res.json({
//             _id: updatedUser.id,
//             username: updatedUser.username,
//             email: updatedUser.email,
//             first_name: updatedUser.first_name,
//             family_name: updatedUser.family_name,
//             favorites: updatedUser.favorites,
//             leagues: updatedUser.leagues,
//             chats: [],
//             color: updatedUser.color,
//             profileImage: updatedUser.profileImage,
//             token: generateToken(updatedUser._id),
//         });
//         res.status(200);
//     }
// });


// @desc Update existing user
// @route POST /upload/:id/:token
// @access Private
exports.upload_image = asyncHandler(async (req, res) => {
    //Confirm user ID
    //validate jwt token
    try {
        const payload = jwt.verify(req.params.token, process.env.JWT_SECRET);
    } catch (err) {
        res.json({ 
            updateStatus: false,
            error: err
        })
        res.status(400)
    }
    //validate user exists
    const user = await User.findOne({_id: req.params.id});
    if (!user) {
        res.status(401)
        throw new Error("User not found");
    };
    //If user has a current profile pic, delete it 
    if (user.profileImage != null) {
        //find image id
        gfs.find({filename: user.profileImage}).toArray((err, files) => {
            //check if file exists
            if (!files || files.length === 0) {
                return res.status(404).json({
                    err: "Current profile image not found"
                });
            };
            //delete image by id
            gfs.delete(files[0]._id, (err) => {
                if (err) {
                    return res.status(404).json({
                        err: "Unable to remove current profile image"
                    });
                };
            });
        });
    }
    //Update user and return updated user with new image
    const updatedUser = await User.findByIdAndUpdate(req.params.id, {profileImage: req.file.filename}, { new: true });
    if (!updatedUser) {
        res.status(401)
        throw new Error("User not found");
    } else {
        res.json({
            _id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            first_name: updatedUser.first_name,
            family_name: updatedUser.family_name,
            favorites: updatedUser.favorites,
            leagues: updatedUser.leagues,
            chats: [],
            color: updatedUser.color,
            profileImage: updatedUser.profileImage,
            token: generateToken(updatedUser._id),
        });
        res.status(200);
    };
});


// @desc Returns image by filename
// @route Get /image/:filename
// @access Private
exports.get_image = asyncHandler(async (req, res) => {

    gfs.find({filename: req.params.filename}).toArray((err, files) => {
        //check if file exists
        if (!files || files.length === 0) {
            return res.status(404).json ({
                err: "no file exists"
            });
        };
        //Check if image
        if (files[0].contentType === "image/jpeg" || files[0].contentType === "image/jpg" || files[0].contentType === "image/png") {
            //read output to browser
            const readstream = gfs.openDownloadStreamByName(req.params.filename);
            readstream.pipe(res);
        } else {
            res.status(404).json({
                err: "Not an image"
            });
        };
    })
});


// // @desc Add a favorite to user document
// // @route POST /user/add/favorite
// // @access Private
// exports.user_add_favorite = asyncHandler(async (req, res) => {
//     const {favId, userId} = req.body;

//     //Check for user
//     let user = await User.findOne({_id: userId})
//     if (!user) {
//         res.status(401)
//         throw new Error("User not found");
//     } 
//     //Check for Player
//     let player = await Player.findOne({_id: favId});
//     if (!player) {
//         res.status(401)
//         throw new Error("Player not found");
//     }
//     let faves = user.favorites;
//     if (!faves) {
//         faves = [];
//     };
//     //Check for location already in favorites
//     if (faves.filter(item => item === favId).length >0) {
//         res.status(401)
//         throw new Error("Favorite already added");
//     }
//     //add favorite data
//     faves.push({
//         refId: favId,
//         name: location.name
//     });
//     //Updates user and returns updarted user details
//     const updatedUser = await User.findByIdAndUpdate(userId, {favorites: faves}, { new: true });
//     if (!updatedUser) {
//         res.status(401)
//         throw new Error("User not found");
//     } else {
//         res.json({
//             _id: updatedUser.id,
//             username: updatedUser.username,
//             email: updatedUser.email,
//             first_name: updatedUser.first_name,
//             family_name: updatedUser.family_name,
//             favorites: updatedUser.favorites,
//             leagues: updatedUser.leagues,
//             chats: [],
//             color: updatedUser.color,
//             profileImage: updatedUser.profileImage,
//             token: generateToken(updatedUser._id),
//         });
//         res.status(200);
//     }
// });


// // @desc Read all users for invite functionality
// // @route GET /user/read/all
// // @access Public
// exports.user_read_all = asyncHandler(async (req, res) => {
//     const usersRaw = await User.find({});
//     usersOut = []
//     usersRaw.forEach(user => {
//         //return username and id
//         usersOut.push({
//             id: user._id,
//             username: user.username,
//         });
//     })

//     // //Check for user by email
//     // const user = await User.findOne({email: email})
//     // if (user) {
//     //     res.json({
//     //         _id: user.id,
//     //         username: user.username,
//     //         email: user.email,
//     //     })
//     // } else {
//     //     res.json({
//     //         _id: "not valid user",
//     //         username: "not valid user",
//     //         email: "not valid user",
//     //     })
//     // }

//     res.status(200).json(usersOut)
// });





  