const express = require ('express');
const router = express.Router();
const {User,validateUpdateUser} = require('../models/User');
const {Scan} = require('../models/Scan');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');
const socket = require('../utils/socket');



/**
 * @desc Get User Profile 
 * @route /api/users/profile
 * @method GET
 * @access public (Admin him self & User himself)
 */

router.get('/profile',verifyToken,asyncHandler( async (req,res)=>{

    const UserProfile = await User.findById(req.user.id).select("-password  -_id  -isAdmin  -__v");

    if(!UserProfile){
       return res.status(404).json({message:"غير موجود"});
        
    }

    res.json({UserProfile});

}));


/**
 * @desc Get ALL users use pagination
 * @route /api/users
 * @method GET
 * @access private (Admin Only)
 */

router.get('/',verifyToken,isAdmin,asyncHandler( async (req,res)=>{
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 10;
    const skip = (page - 1) * limit;
    
   
    const users = await User.find({isAdmin:false}).skip(skip).limit(limit).select("-password -isAdmin -__v").sort({createdAt:-1});
    const total = await User.countDocuments({isAdmin:false});

    

    // check if no users in db
    if(users.length === 0 || total === 0){
       return res.status(404).json({message:"لا يوجد مستخدمين"});
        
    }
    

    res.json({
        page:page,
        limit:limit,
        count:total,
        totalPages:Math.ceil(total / limit),
        users
    });
    
}));


/**
 * @desc Get User By Id
 * @route /api/users/:userId
 * @method GET
 * @access private (Admin Only)
 */

router.get('/:userId',verifyToken,isAdmin,asyncHandler( async (req,res)=>{
    const userId = req.params.userId;

    const user = await User.findById(userId).select("-__v  -isAdmin");

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

    if(req.body.email){
        const anotherUser = await User.findOne({email:req.body.email});

        if(anotherUser && !anotherUser._id.equals(userId)){
            return res.status(400).json({message:"هذا البريد الالكتروني مستخدم بالفعل"});
        }
    }

    const UpdatedUser = await User.findByIdAndUpdate(userId,{
        $set:{
           ...req.body
        }
    },{new:true});

    const io = socket.getIO();

    io.to(userId).emit("update user data",{
        U_firstName : UpdatedUser.firstName,
        U_lastName:UpdatedUser.lastName,
        U_email:UpdatedUser.email,
        U_stage:UpdatedUser.stage
    });

    console.log("updated",UpdatedUser);
    const {password,isAdmin,__v,...other} = await UpdatedUser._doc;

    res.json({message:"تم التحديث بنجاح",...other});
    
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
    const deleteUserScanned = await Scan.deleteOne({userId:userId});
        
    const io = socket.getIO();

    io.to(userId).emit("forceLogout");

    res.json({
        message: "تم حذف هذا المستخدم",
        deletedUser
    });
}));






module.exports = router;