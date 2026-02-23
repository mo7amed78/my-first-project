const express = require('express');
const router = express.Router();
const {User} = require('../models/User');
const asyncHandler = require('express-async-handler');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');

/**
 * @desc get searched student
 * @route /api/search
 * @method GET
 * @access private (only admin)
 */
router.get('/',verifyToken,isAdmin,asyncHandler(async (req,res)=>{

    const search= req.query.search;
    const searchFilter  = {}
    
    if(search){

      searchFilter.$or=[
        {firstName:search},
        {lastName:search}
       ]
    }

    searchFilter.isAdmin = false;

    const result = await User.find(searchFilter).select("-password -_id -__v");

    if(result.length === 0 ){
        return res.status(200).json({result,message:"لا يوجد نتائج للبحث"});
    }


    res.json({result});

}));



module.exports = router;
