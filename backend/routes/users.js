const express = require ('express');
const router = express.Router();
const {User,validateUpdateUser} = require('../models/User');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');



/**
 * @desc Get User Profile 
 * @route /api/users/profile
 * @method GET
 * @access public (Admin him self & User himself)
 */

router.get('/profile',verifyToken,asyncHandler( async (req,res)=>{

    console.log(req.user); 

    const UserProfile = await User.findById(req.user.id).select("-password  -_id  -isAdmin  -__v");

    if(!UserProfile){
       return res.status(404).json({message:"غير موجود"});
        
    }

    res.json({UserProfile});

}));


/**
 * @desc Get ALL users
 * @route /api/users
 * @method GET
 * @access private (Admin Only)
 */

router.get('/',verifyToken,isAdmin,asyncHandler( async (req,res)=>{

    const users = await User.find().select("-password -isAdmin -__v");

    // check if no users in db
    if(users.length === 0){
       return res.status(404).json({message:"لا يوجد مستخدمين"});
        
    }

    res.json({users});
}));


/**
 * @desc Get User By Id
 * @route /api/users/:userId
 * @method GET
 * @access private (Admin Only)
 */

router.get('/:userId',verifyToken,isAdmin,asyncHandler( async (req,res)=>{
    const userId = req.params.userId;

    const user = await User.findById(userId).select("-password -__v  -isAdmin");

    if(!user){
        return res.status(404).json({message:"هذا المستخدم غير موجود"});
       
    }

    res.json({user});
}));


/**
 * @desc Update User
 * @route /api/users/:userId
 * @method PUT
 * @access private (Admin Only)
 */
router.put('/:userId',verifyToken,isAdmin,asyncHandler(async (req,res)=>{

    //check if error

    const {error} = validateUpdateUser(req.body);

    if(error){
        return res.status(400).json({message:error.details[0].message});
    }

    const userId = req.params.userId;

    const user = await User.findById(userId);

    if(!user){
        return res.status(404).json({message:"هذا المستخدم غير موجود"});
    }

    // if password is changed should be hash
    if(req.body.password){
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password , salt);
    }


    const UpdatedUser = await User.findByIdAndUpdate(userId,{
        $set:{
           ...req.body
        }
    },{new:true});

    const {password,isAdmin,__v,...other} = await UpdatedUser._doc;

    res.json({...other});
    
}));


/**
 * @desc Delete User
 * @route /api/users/:userId
 * @method DELETE
 * @access private (Admin Only)
 */

router.delete('/:userId',verifyToken,isAdmin,asyncHandler( async(req,res)=>{
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if(!user){
        return res.status(404).json({message:"هذا المستخدم غير موجود"});
    }

    const deletedUser = await User.findByIdAndDelete(userId).select("-password -isAdmin -__v");

    res.json({
        message: "تم حذف هذا المستخدم",
        deletedUser
    });
}));


module.exports = router;