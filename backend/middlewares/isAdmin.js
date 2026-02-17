const isAdmin = (req,res,next)=>{
    if(!req.user.isAdmin){
      res.status(403)
      throw new Error("مسموح للأدمن فقط");
    }

    next();
}

module.exports = isAdmin ;