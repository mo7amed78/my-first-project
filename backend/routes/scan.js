const express = require('express');
const router = express.Router();
const {Scan,validateUserScanned} = require('../models/Scan')
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');
const asyncHandler = require('express-async-handler');


/**
 * @desc Add User Who scanned in DB
 * @route /api/scan
 * @method POST
 * @access public
 */
router.post('/',verifyToken,asyncHandler( async(req,res)=>{
    const {error} = validateUserScanned(req.body);

    if(error){
       return res.status(400).json({message:error.details[0].message});
    }

    const userScaned = new Scan({
        userId:req.user.id,
        qrCode:req.body.qrCode,
        lectureId:req.body.qrCode, // عشان اقدر اشوف مين عمل مسح قبل كدا واوقفه
        stage:req.user.stage // to use filter only in other routes
    });

    const duplicateScan = await Scan.findOne({userId:req.user.id , lectureId:req.body.qrCode});

    if(duplicateScan){
        return res.status(200).json({Message:"لقد قمت بمسح هذه المحاضره مسبقاً"});
    }

    const Attend = await userScaned.save();
   
    res.status(201).json({Attend});

}));


/**
 * @desc get all scans
 * @route /api/scan
 * @method GET
 * @access private (admin only)
 */
router.get('/',verifyToken,isAdmin,asyncHandler( async (req,res)=>{
    const scans = await Scan.find().populate("userId","firstName lastName stage email").select("-__v");

    if(scans.length === 0){
        return res.status(404).json({message:"لا يوجد نتائج حالياً"});
    }

    res.json({scans});
}));









module.exports = router;