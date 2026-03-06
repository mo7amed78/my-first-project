const mongoose = require('mongoose');
const joi = require('joi');

const LectureSchema = new mongoose.Schema({
    lectureName:{
        type:String,
        trim:true,
        minlength:5,
        maxlength:100,
        required:true
    },

    stage:{
    type:String,
    enum:["الثالث الاعدادي","الاول الثانوي","الثاني الثانوي"]
    },

    date:{
        type:Date,
        default:Date.now

    }

},{timestamps:true});


LectureSchema.index({lectureName:1 , stage:1},{unique:true});

const Lecture = mongoose.model("lecture",LectureSchema);


// validate add lecture 
function validateNewLecture(obj){
    const schema = joi.object({
        lectureName:joi.string().trim().min(5).max(100).required(),
        stage:joi.string().valid("الثالث الاعدادي","الاول الثانوي","الثاني الثانوي").optional(),
    })

    return schema.validate(obj);
}

module.exports = {
    Lecture,
    validateNewLecture
}