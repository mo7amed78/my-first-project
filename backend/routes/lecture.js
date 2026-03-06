const express = require('express');
const router = express.Router();
const {Lecture,validateNewLecture} = require('../models/Lecture');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');
const asyncHandler = require('express-async-handler');



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

    const duplicateLecture = await Lecture.findOne({lectureName:req.body.lectureName , stage:req.body.stage});
    if(duplicateLecture){
        return res.status(400).json({message:"تم إنشاء هذه المحاضرة مسبقًا لنفس المرحلة"});
    }

    const result = await newLecture.save();

    res.json({result});

}));




/**
 * @desc get lecture //! upgrade soon
 * @route /api/lecture
 * @method GET
 * @access private (admin only)
 */
router.get('/',asyncHandler(async (req,res)=>{
    const {lecName} = req.query;

    const find_lec_name = {};

    if(lecName){
        find_lec_name.lectureName =  lecName;
    }

    const get_num_scan = await Lecture.find(find_lec_name);
    console.log(get_num_scan)
    if(!get_num_scan){
        return res.status(200).json({
            message:"لا يوجد محاضرات حالياً",
            count:0,
            lecture:[]
        });
    }


    // const GetLecture = await Scan.distinct('lectureId') ;
    // if(GetLecture.length === 0 ){
    //     res.status(200).json({message:"لم يتم اضافه محاضرات جديده"});
    // }
    res.json({get_num_scan});
}));



module.exports = router;