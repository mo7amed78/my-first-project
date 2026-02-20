const express = require('express');
const router = express.Router();
const {Scan} = require('../models/Scan');
const {User} = require('../models/User');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');
const asyncHandler = require('express-async-handler');



/**
 * @desc get all scans for (1st & 2nd secondary) & 3rd Preparatory 
 * @route /api/filter?query
 * @method GET
 * @access private (admin only)
 */
router.get('/',verifyToken,isAdmin,asyncHandler( async(req,res)=>{

    const {filterLectureId} = req.query ;

    const filter = {};

    if(filterLectureId){
        filter.lectureId = filterLectureId ;
    }

    const filterScan = await Scan.find(filter).populate("userId","firstName lastName email stage").select("-__v");
    const totalStudent = await User.countDocuments();

    if(filterScan.length === 0){
        return res.status(200).json({
            countPresent:0,
            countAbsence:totalStudent,
             message:"لا يوجد نتائج حالياً"
            });
    }


   res.json({
    countPresent:filterScan.length,
    countAbsence:totalStudent - filterScan.length,
    filterScan
});
   
}));



/**
 * @desc get all scans By stage & lectureId
 * @route /api/filter/stageLecture?filterStage=...&filterLectureId=...
 * @method GET
 * @access private (admin only)
 */
router.get('/stageLecture',verifyToken,isAdmin,asyncHandler( async(req,res)=>{

    const {filterStage,filterLectureId} = req.query ;

    const filter = {};

    if(filterStage){
        filter.stage = filterStage ;
    }

    if(filterLectureId){
        filter.lectureId = filterLectureId;
    }
    const filterScan = await Scan.find(filter).populate("userId","firstName lastName email stage").select("-__v");

    if(filterScan.length === 0){
        return res.status(404).json({message:"لا يوجد نتائج حالياً"});
    }


   res.json({
    count:filterScan.length,  
    filterScan
    });
   
}));







module.exports = router;