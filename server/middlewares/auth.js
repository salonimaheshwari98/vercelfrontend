const jwt=require("jsonwebtoken");
require("dotenv").config();
const User=require("../models/User");

//auth
exports.auth = async (req, res, next) => {
    try {
        // Correctly extract token from cookies, body, or header
 const token =
  req.cookies?.token ||
  req.body?.token ||
  (req.header("Authorization")?.startsWith("Bearer ")
    ? req.header("Authorization").split(" ")[1]
    : null);

    

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing",
            });
        }

        // Verify the token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // ✅ This gives you access to decoded.id
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Token is invalid",
            });
        }

        next(); // Continue to next middleware or route handler
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while validating the token",
        });
    }
};

//is Student

exports.isStudent=async (req,res,next)=>{
          try{
              //use payload 
              if(req.user.accountType!=="Student"){
                return res.status(401).json({
                    success:false,
                    message:"This is protected routes for students only",

                })
              }
              next();
                 
          }catch(error){
              return res.status(500).json({
                success:false,
                message:"User role cannot be verified, please try again",
              })
          }
}

// is Instructor

exports.isInstructor=async (req,res,next)=>{
    try{
        //use payload 
        if(req.user.accountType!=="Instructor"){
          return res.status(401).json({
              success:false,
              message:"This is protected routes for instructor only",

          })
        }
        next();
           
    }catch(error){
        return res.status(500).json({
          success:false,
          message:"User role cannot be verified, please try again",
        })
    }
}

//is Admin

exports.isAdmin=async (req,res,next)=>{
    try{
        //use payload 
        if(req.user.accountType!=="Admin"){
          return res.status(401).json({
              success:false,
              message:"This is protected routes for admin only",

          })
        } 
        next();
           
    }catch(error){
        return res.status(500).json({
          success:false,
          message:"User role cannot be verified, please try again",
        })
    }
}


