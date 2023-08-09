const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();
const bcrypt=require("bcryptjs");
const jwt=require('jsonwebtoken');
const fetchuser=require('../middleware/fetchuser')
const jwt_secret='mukulranaowner'
//Route 1: Create user using POST "api/auth/createuser" Does not require login
router.post('/createuser', [
  body('name', 'Enter a valid name!').isLength({ min: 5 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password','Password minimum length is 8').isLength({ min: 5 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const secpass = await bcrypt.hash(req.body.password, salt);

    var user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secpass
    });

    const data = {
      user: { id: user.id }
    };
    const authtoken = jwt.sign(data, jwt_secret);
    res.json({ success: true, authtoken });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route 2: Create user using POST "api/auth/login"  NO login require
router.post('/login', [
 
  body('email', 'Enter a valid email').isEmail(),
  body('password','Password is not Blank').exists()
], async (req, res) => {const errors = validationResult(req);
  let success=false
  // if there are errors thnn return bad gateway and errors
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
 const {email,password}= req.body 
 try {
  let user=await User.findOne({email})
  if (!user){
    success=false
    return res.status(400).json({error:"Please Use Correct Credentials !"})  
  }
   const passcompare= await bcrypt.compare(password,user.password)
   if (!passcompare){
    success=false
     return res.status(400).json({success,error:"Please Use Correct Credentials !"})  
   }
   const payload={
    user:{id:user.id}
   }
   const authtoken = jwt.sign(payload, jwt_secret);
   success=true
   res.json({success, authtoken });
 } catch (error) {

    res.status(500).send("Internal Server Error occured")
 }
} )
// Route 3: Get logged in  user details  using POST "api/auth/getuser"  require login
router.post('/getuser',fetchuser, async (req, res) => {
  
try {
  let userid=req.user.id
 const user=await User.findById(userid).select('-password') 
res.send(user)
} catch (error) {
  console.log(error)
  res.status(500).send("Internal Server Error occured")
}})
module.exports = router;
