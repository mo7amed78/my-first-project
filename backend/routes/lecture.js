const express = require('express');
const router = express.Router();
const {Lecture,ActiveLecture,validateNewLecture} = require('../models/Lecture');
const {Scan} = require('../models/Scan');
const { User } = require('../models/User');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');
const asyncHandler = require('express-async-handler');
const {convertTimeDate_ToDate , egyptTime} = require('../utils/timeEdit');
const socket = require('../utils/socket');


/**
 * @desc add new lecture
 * @route /api/lecture
 * @method POST
 * @access private
 */
router.post('/',verifyToken,isAdmin,asyncHandler(async (req,res)=>{
    const {error} = validateNewLecture(req.body);

    if(error){
       return res.status(400).json({message:error.details[0].message})
    }

    const newLecture = new Lecture({
        ...req.body
    });


    // active lecture //
     await ActiveLecture.updateOne(
        {},
        {
           currentLectureId:newLecture._id
        },
        {upsert:true}
    )
    // active lecture //


    const duplicateLecture = await Lecture.findOne({lectureName:req.body.lectureName , stage:req.body.stage});
    if(duplicateLecture){
        return res.status(400).json({message:"تم إنشاء هذه المحاضرة مسبقًا لنفس المرحلة"});
    }

    const result = await newLecture.save();

    const today = result.createdAt;
    const filterCountSessionPerDay = {};
    const filterAtendedRecord ={};

    filterCountSessionPerDay.createdAt = convertTimeDate_ToDate(today);
    const updated_num_session = await Lecture.countDocuments(filterCountSessionPerDay);

    filterAtendedRecord.scannedAt = convertTimeDate_ToDate(today);
    const update_present = await Scan.countDocuments(filterAtendedRecord);
    const totalStudent = await User.countDocuments({isAdmin:false});

    const io = socket.getIO();

    io.emit("updated_num_session",{
        updatedNumSession:updated_num_session,
        updateStageValue:result.stage,
        countPresent:update_present,
        countAbsent:totalStudent - update_present

    });

    res.status(201).json({result});

}));




/**
 * @desc get lectureName And number of session 
 * @route /api/lecture
 * @method GET
 * @access private (admin only)
 */
router.get('/',verifyToken,isAdmin,asyncHandler(async (req,res)=>{

    const {today} = req.query;
    
    const date = today? new Date(today) :null;

    const filterCountSessionPerDay = {};
    if(date){
        filterCountSessionPerDay.createdAt = convertTimeDate_ToDate(date);
    }

    const get_lecs_records = await Lecture.find(filterCountSessionPerDay).sort({ createdAt:-1 });
    
    if(get_lecs_records.length === 0){
        return res.status(200).json({
            message:"لا يوجد محاضرات حالياً",
            count:0,
            lecture:[]
        });
    }

    const get_lecs = get_lecs_records.map(item=>({
            ...item._doc,
            timeEdit:egyptTime(item.createdAt)
    }));


    res.json({
        countSession:get_lecs.length,
        get_lecs
    });
}));



module.exports = router;