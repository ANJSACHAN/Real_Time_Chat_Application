const express = require('express');

const app = express();
const router = express.Router();
const bcrypt  =  require('bcrypt');
const User  = require('../model/user');
const jwt = require('jsonwebtoken');
const Authentication = require('../middleware/middleware')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Your route handling code here



router.post("/register",async (req, res) => {
    console.log("register"); 
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.send({ error: "Fill Complete details" });
    }
    console.log(name + " " + email + " " + password);

    const encryptedPassword = await bcrypt.hash(password, 10);
    try {
        console.log(name + " " + email + " " + password);

        const oldUser = await User.findOne({ email });

        
        if (oldUser) {
            return res.json({ error: "User Exists" });
        }
        const response = await User.create({
            name,
            email,
            password: encryptedPassword
        });
        return res.json({ success: "User Registered Successfully" });
        // res.send({ status: "Data Save Succesfully" });
    } catch (error) {
        res.status(400).send({ message: error });
    }
});
  

router.post("/login",async (req, res) => {
    console.log("login");
    const { email, password } = req.body;

    console.log(email + " " + password);

    const user = await User.findOne({ email });
    if (!user) {
        return res.json({ error: "User Not found" });
    }
    console.log(user);
    if (await bcrypt.compare(password, user.password)) {
        console.log(user);
        const token = jwt.sign({email: user.email,name: user.name, id:user._id}, process.env.JWT_SECRET)
        if (res.status(201)) {
            return res.json({ status: "ok", message: "Login Successfully", data: token, user:user });
        } else {
            return res.json({ error: "error" });
        }
    }
    res.json({ status: "error", error: "Invalid Authentication" });
});


router.get("/allUsers",Authentication,async(req,res)=>{
    console.log('inside allusers');

    try{
        const allUsers = await User.find();
        if(!allUsers || allUsers.length===0) return res.status(400).json({message: 'user not found'});
        console.log(allUsers);
        return res.status(200).json(allUsers);
    }catch(error){
        res.status(400).json({message:"error in the allusers api"+error})
    }

});

router.post('/send_request', async (req, res) => {
    const { recId , senderId } = req.body;
    console.log(recId, senderId);
    try {
        const receiver = await User.findOne({ _id: recId });
        const sender = await User.findOne({ _id: senderId });
        if (!receiver || !sender) {
            return res.status(404).send("One or more users not found!");
        }
        receiver.friend_request.push(senderId);
        await receiver.save();

        res.status(200).send("Friend request sent successfully!");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});


router.post('/accept_request', async(req, res) => {
    const { recId, senderId } = req.body;
    try {
        const receiver = await User.findOne({ _id: recId });
        const sender = await User.findOne({ _id: senderId });
        if (!receiver || !sender) {
            return res.status(404).send("One or more users not found!");
        }
        receiver.friend_list.push(senderId);
        sender.friend_list.push(recId);

        receiver.friend_request.pull(senderId);
        
        await receiver.save();
        await sender.save();

        res.status(200).send("Friend request accepted successfully!");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});

router.post('/delete_request', async(req, res) => {
    const { recId, senderId } = req.body;
    try {
        const receiver = await User.findOne({ _id: recId });
        const sender = await User.findOne({ _id: senderId });
        if (!receiver || !sender) {
            return res.status(404).send("One or more users not found!");
        }

        receiver.friend_request.pull(senderId);
        
        await receiver.save();

        res.status(200).send("Friend request deleted successfully!");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});


router.post('/unfriend', async(req, res) => {
    const { recId, senderId } = req.body;
    try {
        const receiver = await User.findOne({ _id: recId });
        const sender = await User.findOne({ _id: senderId });
        if (!receiver || !sender) {
            return res.status(404).send("One or more users not found!");
        }
        
        sender.friend_list.pull(recId);
        receiver.friend_list.pull(senderId);
        
        await receiver.save();
        await sender.save();

        res.status(200).send("Now you both are no longer friends!");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});











module.exports = router;
