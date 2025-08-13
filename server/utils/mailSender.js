const nodemailer=require("nodemailer");

const mailSender=async(email,title,body)=>{
    try{
         let transporter=nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,

            }
         })

         let info =await transporter.sendMail({
            from:'StudyNotion||Ed Tech-by Saloni',
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`,
         })
         console.log(info);
         return info;
    }
    catch(error){
          console.log(error.message);
    }
}

module.exports=mailSender;////mail sender wala code isliye likhe taaki otp ko mail mein send karpaye