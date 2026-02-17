const mongoose = require('mongoose');
const joi = require('joi');

const UserSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        trim:true,
        minlength:6,
        maxlength:100,
        unique:true
    },

    password:{
        type:String,
        required:true,
        trim:true,
        minlength:8,
    },

    firstName:{
        type:String,
        required:true,
        trim:true,
        minlength:4,
        maxlength:200,
    },

    lastName:{
        type:String,
        required:true,
        trim:true,
        minlength:4,
        maxlength:200,
    },


    stage:{
        type:String,
        enum:["الثالث الاعدادي","الاول الثانوي","الثاني الثانوي"],
        
    },

    isAdmin:{
        type:Boolean,
        default:false
    }

},{timestamps:true});


const User = mongoose.model("user",UserSchema);


// validation register 
function validateRegisterUser(obj){
    const schema = joi.object({
        email:joi.string().trim().min(6).max(100).email().required(),
        password: joi.string().trim().min(8).required(),
        firstName: joi.string().trim().min(4).max(200).required(),
        lastName: joi.string().trim().min(4).max(200).required(),
        stage:joi.string().valid("الثالث الاعدادي","الاول الثانوي","الثاني الثانوي").optional(),
    });

    return schema.validate(obj);
};


// validation login

function validateLoginUser(obj){
    const schema = joi.object({
        email:joi.string().trim().min(6).max(100).email().required(),
        password: joi.string().trim().min(8).required(),
    });

    return schema.validate(obj);
};


// validation update 

function validateUpdateUser(obj){
    const schema = joi.object({
        email:joi.string().trim().min(6).max(100).email(),
        password: joi.string().trim().min(8),
        firstName: joi.string().trim().min(4).max(200),
        lastName: joi.string().trim().min(4).max(200),
        stage:joi.string().valid("الثالث الاعدادي","الاول الثانوي","الثاني الثانوي").optional(),
    });
    return schema.validate(obj);
};



module.exports = {
    User,
    validateRegisterUser,
    validateLoginUser,
    validateUpdateUser
};
