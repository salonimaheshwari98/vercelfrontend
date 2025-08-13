const User=require("../models/User");
const mailSender=require("../utils/mailSender");
const bcrypt=require("bcrypt");


///reset password Token-->mail send krega
   exports.resetPasswordToken=async (req,res)=>{
   try{
     //get email from body
     const { email } = req.body;


     //check user for this email, email validation
     const user= await User.findOne({email:email});
     if(!user){
         return res.json({
          success:false,
          message:"Your email is not registered with us",
         })
     }
 
     //generate token and har user k model mein khud ka token aur expiration time hoga
 
     const token =crypto.randomUUID();
 
     //update user by adding token in user and add also expiration time
 
     const updatedDetails= await User.findOneAndUpdate({email:email},
                                                        {
                                                         token:token,
                                                         resetPasswordExpries:Date.now()+5*60*1000,
                                                        },
                                                        {new:true});//new seh updated document return hoga response mein
 
 
     //create url
 
     const url=`http://localhost:3001/update-password/${token}`
     //frontend ka link hain jismein humne tokwn daaldiya hain uske karan differentiating link banenge
 
 
     //send mail containing the url
        await mailSender(email, 
                         "Password Reset Link",
                          `Password Reset Link: ${url}`);
 
 
  
 
     //return response
 
     return res.json({
         success:true,
         message:"Email sent successfully, please check email and change pwd",
     });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while reset",
        })
    }

   
}
////reset password -->db mein update krega

exports.resetPassword=async(req,res)=>{

    try{

        //data fetch
       const {password,confirmPassword,token}=req.body;

       //validation 
       if(password!==confirmPassword){
           return res.json({
               success:false,
               message:"Password not matching",
           });
       }
   
       //get userdetails from db using token 
        const userDetails= await User.findOne({token:token});
       //if no entry - invalid token\
       if(!userDetails){
           return res.json({
               success:false,
               message:"Token is invalid",
           });
       }
       //if token time expires then also token will be invalid so check time 
       if(userDetails.resetPasswordExpries < Date.now()){
           //means tken is expire
           return res.json({
               success:false,
               message:"Token is expired, please regenrate your token"
           });
       }
       
   
   
       ///hash the password
   
       const hashedPassword=await bcrypt.hash(password,10);
   
       //update the password
       await User.findOneAndUpdate({token:token},
           {password:hashedPassword},
           {new:true})
   
       //return response
       return res.status(200).json({
           success:true,
           message:"Password reset successful",
       })
   

    }catch(error){
        console.log(error);
        return res.status(500).json({
        success:false,
        message:"Error occured in reset of password",

       })
    }
}





