const express = require('express');
const router = express.Router();
const {User,validateRegisterUser,validateLoginUser} = require('../models/User');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');


/**
 * @desc Register New user
 * @route /api/auth/register
 * @method POST
 * @access private (add users by admin only)
 */
    router.post('/register',verifyToken,isAdmin,asyncHandler( async(req,res)=>{
        const {error} = validateRegisterUser(req.body);

        if(error){
            return res.status(400).json({message:error.details[0].message});
        }

        // check for no overright email in database
        const checkRegister = await User.findOne({email:req.body.email});
        if(checkRegister){
           return res.status(200).json({message:"هذا البريد الالكتروني مستخدم بالفعل"});
        }

        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password,salt);

        const NewUser = new User({
            email:req.body.email,
            password:req.body.password,
            firstName:req.body.firstName,
            lastName:req.body.lastName,
            stage:req.body.stage
        });

        const result = await NewUser.save();

        const {password,...other} = result._doc;

        res.status(201).json({message:"تم اضافة مستخدم جديد بنجاح",...other});



    }));




  /**
  * @desc login user or admin
  * @route /api/auth/login
  * @method POST
  * @access public
  */

    router.post('/login',asyncHandler( async(req,res)=>{
        const {error} = validateLoginUser(req.body);

        if(error){
            return res.status(400).json({message:error.details[0].message});
        }

        // check for no overright email in database
        const checkLogin = await User.findOne({email:req.body.email});
        if(!checkLogin){
             res.status(400)
             throw new Error("البيانات غير صحيحة");

        }

        const passwordIsMatch = await bcrypt.compare(req.body.password,checkLogin.password);

        if(!passwordIsMatch){
             res.status(400)
             throw new Error("البيانات غير صحيحة");
        }

        
        const token = jwt.sign({id:checkLogin._id,firstName:checkLogin.firstName,lastName:checkLogin.lastName,isAdmin:checkLogin.isAdmin,stage:checkLogin.stage},
            process.env.JWT_SECRET_KEY,
            {
                expiresIn:"30d"
            }
        );

        const {password,__v,isAdmin,...other} = checkLogin._doc;

        res.json({...other,token});

        

    }));
   

module.exports = router;