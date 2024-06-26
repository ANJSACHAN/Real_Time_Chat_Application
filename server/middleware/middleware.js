const jwt = require('jsonwebtoken');
const User = require('../model/user');
const express = require('express');
const app = express();
const router  = express.Router();

const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());



const authenticateToken = async(req,res,next)=>{
    const authHeader = req.headers.authorization;
    console.log(req.headers);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });

    } 
    const token = authHeader.split(' ')[1];
    
 
    if(!token){
        res.status(401).json({message: 'token not provided'});
    }
    try{
        const decode = jwt.verify(token,process.env.JWT_SECRET);

        const{email} = decode;

        const user = await User.findOne({email});

        if(!user){
            res.status(401).json({message: 'user not found'});

        }
        req.user = user;
        // console.log(user);
        next();
    }catch(error){
        res.status(401).json({message: 'Invalid Token',error});

    }
}

module.exports = authenticateToken