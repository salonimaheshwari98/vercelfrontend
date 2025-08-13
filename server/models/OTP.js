const mongoose=require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60,
    }
});

//function to send emails

async function sendVerificationEmail(email,otp) {
    try{
         const mailResponse=await mailSender(email,"Verification Email",emailTemplate(otp));
         console.log("Email sent successfully:",mailResponse.response);
    }
    catch(error){
        console.log("error occured while sending emails:" ,error);
        throw error;
    }
}

OTPSchema.pre("save",async function(next){
    console.log("New Doc saved to database");

    if(this.isNew){
        await sendVerificationEmail(this.email,this.otp);
    }
   
    next();//doc save honeh seh pehle ek verification mail jayega with data email and otp of current obj and then next middle ware k upar jayenge
})


module.exports=mongoose.model("OTP",OTPSchema);