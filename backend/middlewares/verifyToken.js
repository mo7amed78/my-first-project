
const jwt = require('jsonwebtoken');

const verifyToken = (req,res,next)=>{
    const authHeader = req.headers['authorization'];          
    const token = authHeader && authHeader.split(' ')[1];     

    if(token){
        try {
            const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY ); // {id: ....};

            req.user = decoded;
            
            next();
        } catch (error) {
            res.status(401)
            throw new Error("invalid Token");
        }

    }else{
        res.status(401)
        throw new Error("Error 401");
    }
}


module.exports = verifyToken;