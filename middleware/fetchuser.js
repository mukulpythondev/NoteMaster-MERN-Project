const jwt=require('jsonwebtoken');
const jwt_secret='mukulranaowner'
const fetchuser=(req,res,next)=>{
// Get the user from  jwt token and add id to req object
const token=req.header("auth-token")
if (!token){
    res.status(401).send({error:"Please Authanticated using valid user."})
    
}
try {
    const data=jwt.verify(token,jwt_secret)
req.user=data.user;
next();
} catch (error) {
  
    res.status(401).send({error:"Please Authanticated using valid user."})
}
}
module.exports=fetchuser;