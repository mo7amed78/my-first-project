const mongoose = require('mongoose');
const joi = require('joi');

const ScanSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    }, 

    lectureId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"lecture",
        required:true
    },

    stage:{
        type:String,
        enum:["الثالث الاعدادي","الاول الثانوي","الثاني الثانوي"]
    },

    scannedAt:{
        type:Date,
        default:Date.now
    }
});

ScanSchema.index({userId:1 , lectureId:1,},{unique:true});


const Scan = mongoose.model('scan',ScanSchema);

// validation add user scanend

function validateUserScanned(obj){
    const schema = joi.object({
        userId:joi.string().length(24).hex().required(),
        lectureId:joi.string().length(24).hex().required()
        
    });

    return schema.validate(obj);
}

module.exports = {
    Scan,
    validateUserScanned
};