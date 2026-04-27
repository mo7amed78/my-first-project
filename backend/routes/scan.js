const express = require('express');
const router = express.Router();
const {Scan,validateUserScanned} = require('../models/Scan');
const {User} = require('../models/User');
const {Lecture,ActiveLecture} = require('../models/Lecture');
const{egyptTime} = require('../utils/timeEdit');
const {convertTimeDate_ToDate} = require('../utils/timeEdit');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');
const asyncHandler = require('express-async-handler');
const socket = require('../utils/socket');


/**
 * @desc Add User Who scanned in DB
 * @route /api/scan
 * @method POST
 * @access public
 */
router.post('/',verifyToken,asyncHandler( async(req,res)=>{
    const {error} = validateUserScanned(req.body);

    if(error){
       return res.status(200).json({message:error.details[0].message});
    }

    const checkUserisExist = await User.findById(req.user.id);

    if(!checkUserisExist){
        return res.status(404).json({message:"User Not Found"});
    }
    
    
    const isActiveLec = await ActiveLecture.findOne();

    if(!isActiveLec || isActiveLec.currentLectureId.toString() !== req.body.lectureId){

        return res.status(200).json({message:"انتهت صلاحية المحاضرة"})
    }

    const duplicateScan = await Scan.findOne({userId:req.user.id , lectureId:req.body.lectureId});

    const lecture = await Lecture.findById(req.body.lectureId);

    if(!lecture){
        return res.status(200).json({message:"المحاضرة غير موجودة"});
    }

    if(lecture.stage !== checkUserisExist.stage){
        return res.status(200).json({message:"هذه المحاضرة غير مخصصة لمرحلتك"});
    }

    if(duplicateScan){
        return res.status(200).json({message:"لقد قمت بمسح هذه المحاضره مسبقاً"});
    }
    

    const userScaned = new Scan({
        userId:req.user.id,
        lectureId:req.body.lectureId, // عشان اقدر اشوف مين عمل مسح قبل كدا واوقفه
        stage:checkUserisExist.stage // to use filter only in other routes
    });

    
    
    const AttendRecord = await userScaned.save();

    const filter = {};
    const today = AttendRecord.scannedAt;
    filter.scannedAt = convertTimeDate_ToDate(today);
    const updated_num_present = await Scan.countDocuments(filter);
    const totalStudent = await User.countDocuments({isAdmin:false});
    

    const filterNumScans = {}
    filterNumScans.lectureId = AttendRecord.lectureId;
    filterNumScans.stage = AttendRecord.stage;
    const update_num_scans = await Scan.countDocuments(filterNumScans);

    
    
    const filterNewStudent = {}
    filterNewStudent.userId = AttendRecord.userId;
    filterNewStudent.lectureId = AttendRecord.lectureId;
    filterNewStudent.stage = AttendRecord.stage;

    const update_table = await Scan.find(filterNewStudent).populate("userId",'firstName lastName stage');

    const update_table_time = update_table.map(item=>({
        ...item._doc,
        timeEdit:egyptTime(item.scannedAt)
    }));


    const io = socket.getIO();
    io.emit("updated_num_present_absent",{
        countPresent:updated_num_present,
        countAbsent:totalStudent - updated_num_present,
        update_num_scans:update_num_scans,
        update_table:update_table_time
    });

    const Attend = {
        ...AttendRecord._doc,
        firstName:checkUserisExist.firstName,
        lastName:checkUserisExist.lastName,
        timeEdit:egyptTime(AttendRecord.scannedAt)
    }
   
    res.status(201).json({Attend});

}));


/**
 * @desc get all scans
 * @route /api/scan
 * @method GET
 * @access private (admin only)
 */
router.get('/',verifyToken,isAdmin,asyncHandler( async (req,res)=>{
    const scans= await Scan.find().populate("userId","firstName lastName stage email")
                                    .populate("lectureId","lectureName stage date").select("-__v");

    if(scans.length === 0){
        return res.status(404).json({message:"لا يوجد نتائج حالياً"});
    }

    

    res.json({
        count:scans.length,  
        scans
        
    });
}));






module.exports = router;