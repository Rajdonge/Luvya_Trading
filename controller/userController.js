const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel');
const jwt = require('jsonwebtoken');

const nodemailer = require('nodemailer');

//send mail to verify email
const sendVerifyMail = async(fullName, email, user_id) => {
    try{
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'testdjango4321@gmail.com',
                pass: 'xxov azkm jomo mlbe'
            }
        });
        const mailOptions = {
            from: 'testdjango4321@gmail.com',
            to: email,
            subject: 'Email verification',
            html: '<p>Hi '+fullName+' , please click here to <a href="http://localhost:8080/api/v1/verify?id='+user_id+'"> verify </a> your mail. </p>'
        }
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            }else{
                console.log("Email has been sent:- ", info.response);
            }
        })
    }catch(error){
        console.log(error.message);
    }
}

const verifyMail = async(req, res) => {
    try{
        const updateInfo = await UserModel.updateOne({_id: req.query.id}, {$set:{ is_verified:true }});
        console.log(updateInfo);
        res.render("email-verified");
    }catch(error){
        console.log(error.message);
    }
}

module.exports = {

    //validate req.body - Done
    //create MongoDB model -  Done
    //do password encryption
    //save data to mongodb
    //return response to the client

    registerUser: async (req, res) => {
        const { fullName, email, password } = req.body;

        try {
            // Check if user already exists with the provided email
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User with this email already exists' });
            }

            // Create a new user model instance
            const newUser = new UserModel({
                fullName,
                email,
                password: await bcrypt.hash(password, 10) // Hash the password
            });

            // Save the new user to the database
            const savedUser = await newUser.save();

            // Send verification email
            await sendVerifyMail(fullName, email, savedUser._id);

            // Return success response
            return res.status(201).json({ message: 'User registered successfully', user: savedUser });
        } catch (error) {
            console.error('Error registering user:', error);
            return res.status(500).json({ message: 'Failed to register user', error });
        }
    },
    
    //check user existing email
    //compare password
    //create jwt token
    //send response to client
    loginUser: async (req, res)=> {
        try{
            const user = await UserModel.findOne({email: req.body.email});
            if(!user){
                return res.status(401)
                .json({message: "Authentication failed, Invalid email or password."})
            }
            
            const isPassEqual = await bcrypt.compare(req.body.password, user.password);
            if(!isPassEqual){
                return res.status(401)
                .json({message: "Authentication failed, Invalid email or password."})

            }
            const tokenObject = {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
            }
            const jwtToken = jwt.sign(tokenObject, process.env.SECRET, {expiresIn: '4h'});
            return res.status(200)
            .json({jwtToken, tokenObject})
        }catch(error){
            console.error("Error occurred while logging in:", error);
            return res.status(500).json({message: "Error", error});
        }
    },

    getUsers : async(req, res) => {
        try{
        const users = await UserModel.find({}, {password:0});
        return res.status(200)
        .json({data: users});
        }catch(error){
            return res.status(500)
            .json({message: 'Error', error});
        }
    },
    
    userProfile : async (req, res) => {
        try {
            // Access user information from req.user object
            const userId = req.user._id;
    
            // Retrieve the user data using the user ID
            const user = await UserModel.findById(userId, { password: 0 });
    
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
    
            // Return the user profile data
            return res.status(200).json({ data: user });
        } catch (error) {
            console.error("Error occurred while fetching user profile:", error);
            return res.status(500).json({ message: "Error", error });
        }
    },

    updateUserData : async (req, res) => {
        try{
            const userId = req.user._id;
            const updatedUser = await UserModel.findByIdAndUpdate(userId, req.body, {new: true});
            if(!updatedUser){
                return res.status(404).json({message: 'User not found.'});
            }
            return res.status(200).json({ message: 'User updated successfully.', data: updatedUser });
        }catch(error){
            return res.status(404).json({message: "User not found.", error});
        }
    },

    changePassword : async (req, res) => {
        try {
            // Extract user ID from the request
            const userId = req.user._id;
    
            // Retrieve the user from the database
            const user = await UserModel.findById(userId);
    
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }
    
            // Check if the provided current password matches the stored password
            const isCurrentPasswordValid = await bcrypt.compare(req.body.currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return res.status(401).json({ message: 'Current password is incorrect.' });
            }
    
            // Encrypt the new password
            const newPasswordHash = await bcrypt.hash(req.body.newPassword, 10);
    
            // Update the user's password
            user.password = newPasswordHash;
            await user.save();
    
            return res.status(200).json({ message: 'Password changed successfully.' });
        } catch (error) {
            console.error("Error occurred while changing password:", error);
            return res.status(500).json({ message: "Error", error });
        }
    },
    verifyMail
    
}
