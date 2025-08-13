//send otp



const User=require("../models/User");
const OTP=require("../models/OTP");
const otpGenerator=require("otp-generator");
const bcrypt= require("bcrypt");
const jwt=require("jsonwebtoken");
const Profile = require("../models/Profile");

require("dotenv").config();
//this function will generate otp

exports.sendOTP=async(req,res)=>{
    
    try{

    
    //fetch email from req ki body

    const{email}=req.body;

    //check if user already exist

    const checkUserPresent=await User.findOne({email});

    //if user already exist then return a response
    if(checkUserPresent){
        return res.status(401).json({
            success:false,
            message:"User already registered",
        });
    }


    //generate otp
     
     var otp=otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
     });//hum otp mein lower upper case nhi lenge bs and this code generates the otp
     console.log("OTP generated: ", otp);

     //make sure that otp obrained is unique
      var result=await OTP.findOne({otp:otp});

      while(result){
             otp=otpGenerator(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
             });
             result=await OTP.findOne({otp:otp});
      }//jb tkk mujhe ish yeh otp milra h tbh tkk naya otp generate karte rehna higa

//the above code is brute force which is not recommeneded for the companies
      const otpPayload={email,otp};


      //create an entry in db for  otp
      const otpBody = await OTP.create(otpPayload);
      console.log(otpBody);

      //return response successful
      res.status(200).json({
        success:true,
        message:"OTP sent successfully",
        otp,
      })
}
catch(error){
       console.log(error);
       return res.status(500).json({
        success:false,
        message:error.message,

       })
}
}




//signup

exports.signUP= async(req,res)=>{
    //ftexh the data from req body

    try{
        const{
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        }=req.body;
        //validate the data acc type add nhi kiya kyu ki student aur instructor k bich mein hi toggle hoga toh ek value aayegi hi 
         if(!firstName||!lastName||!email||!confirmPassword||!password
            ||!otp
         ){
            return res.status(403).json({
                success:false,
                message:'All fields are required',
            })
         }
    
    
        // match the two passwords(confirm and normal pwd)
    
        if(password!==confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password and Confirm password values doesnot match, please try again"
            })
        }
    
        //check if the user already exists or not 
         const exisitingUser=await User.findOne({email});
         if(exisitingUser){
            return res.status(400).json({
                success:false,
                message:"User is already registered",
            })
         }
    
        //find most recent otp for the user
        const recentOtp=await OTP.find({email}).sort({createdAt:-1}).limit(1);
        //we are finding the most recent otp since we are sorting it in the basis of the timestamp
        console.log(recentOtp);
    
    
        //validate the otp
        if(recentOtp.length==0){
            //otp not found
            return res.status(400).json({
                success:false,
                message:"OTP NOT FOUND",
            })
        }
        else if(otp!==recentOtp[0].otp){
            //invalid otp
            return res.status(400).json({
                success:false,
                message:"OTP is not valid, please enter the valid otp",
            })
        }
    
        //hash the password 
         const hashedPassword=await bcrypt.hash(password,10);
    
    //need to create profile so as to enter it in the additional details
    const profileDetails=await Profile.create({
        gender:null,
        dateofBirth:null,
        about:null,
        contactNumber:null,
    
    })
    
    //db mein bhi save krna hoga profile k obj id ko
    
    
        //and make the entry in the database
        const user=await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,//this is an api used to create the image according to the fist and last name i.e SM for my nname
    
        })
    //return res

    return res.status(200).json({
        success:true,
        message:"user is registered successfully",
        user,
    })

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered. Please try again",
            error:error.message,
        })
    }

}



//login

 exports.login= async (req,res)=>{

    try{

        //get data from req body
        const {email,password}=req.body;


        //validation of data
        if(!email||!password){
            return res.status(403).json({
                success:false,
                message:"All fields are required, please try again",
            })
        }

        //check user if exists or not
        const user=await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                status:false,
                message:"User is not registered, please signup first",
            })
        }

        //generate jwt only after matching token
        if(await bcrypt.compare(password,user.password)){
            const payload={
                email:user.email,
                id:user._id,
                accountType:user.accountType,

            }
            const token =jwt.sign(payload, process.env.JWT_SECRET,{
                expiresIn:"2h",
            });
            user.token=token;
            user.password=undefined;
       

        //create cookies and send response

        const options={
            expiresIn:new Date(Date.now()+3*24*60*60*1000),
            httpOnly:true,
        }

        res.cookie("token",token,options).status(200).json({
            success:true,
            token,
            user,
            message:"Logged in successfully",
        })
    }
    else{
        return res.status(401).json({
            success:false,
            message:"Password is incorrect ",
        })
    }

    }   catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Login failure ,please try again",
        })

    }       
 };

//change pwd

exports.changePassword = async (req, res) => {
  try {
    // Get user data from req.user
    const userDetails = await User.findById(req.user.id)

    // Get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword } = req.body

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    )
    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" })
    }

    // Update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10)
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    )

    // Send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password for your account has been updated",
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      )
      console.log("Email sent successfully:", emailResponse.response)
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      })
    }

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error)
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    })
  }
}




