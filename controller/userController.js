const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../model/userModel');

exports.addUserController = async (req, res, next) => {
    const { username, password} = req.body;
    if(username!=''&&password!=''){
        try{
            let hash = await bcrypt.hash(password, 10);
            const User = new UserModel({username:username ,password: hash});
            let addedUser = await User.registerUser();
            if(addedUser.result.ok==1){
                res.status(201).json({
                    status:true,
                    message:"User created."
                });
            }
        }catch(err){
            res.status(500).json({
                status:false,
                error:err.message
            });
        }
    }
}

exports.loginController = async (req, res, next) => {
    const { username, password} = req.body;
    if(typeof username == 'undefined'||typeof password == 'undefined'){
        res.status(400).json({
            status:false,
            error:'username of password is null.'
        });
    }
    let findUser = await UserModel.findUserByUsername({username:username});
    console.log(findUser);
    // res.send('JSON.stringify(findUser)');
    if(findUser.length>0){
        try{
            let comparePw = await bcrypt.compare(password, findUser[0].password);
            if(comparePw){
                let jwtToken = jwt.sign({
                    username: findUser[0].username,
                    userId: findUser[0]._id
                },
                "mewSecretToken",
                {
                    expiresIn: "1h"
                });
                res.status(200).json({
                    token: jwtToken,
                    expiresIn: 3600,
                });
            }else{
                res.status(401).json({
                    status:false,
                    message:'Authentication failed.'
                });
            }
        }catch(err){
            res.status(401).json({
                'status':false,
                'message':"Authentication failed.",
                'error':err
            });
        }
    }else{
        res.status(401).json({
            'status':false,
            'message':"Authentication failed. username not found."
        });
    }
}
