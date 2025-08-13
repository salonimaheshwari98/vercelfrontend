const mongoose = require('mongoose');
const {instance}=require("../config/razorpay");
const Course=require("../models/Course");
const User=require("../models/User");
const mailSender=require("../utils/mailSender");
const {courseEnrollmentEmail}=require("../mail/templates/courseEnrollmentEmail");
const CourseProgress=require("../models/CourseProgress")
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")
const crypto = require("crypto")
require('dotenv').config()




// Capture the payment and initiate the Razorpay order
//creates the order
exports.capturePayment = async (req, res) => {
 console.log(process.env.RAZORPAY_KEY, process.env.RAZORPAY_SECRET)

  const { courses } = req.body
  const userId = req.user.id//middleware mein insert kiya tha
  if (courses.length === 0) {
    return res.json({ success: false, message: "Please Provide Course ID" })
  }

  let total_amount = 0

  for (const course_id of courses) {
    let course
    try {
      // Find the course by its ID
      course = await Course.findById(course_id)

      // If the course is not found, return an error
      if (!course) {
        return res
          .status(200)
          .json({ success: false, message: "Could not find the Course" })
      }
         let uid;
      // Check if the user is already enrolled in the course
      if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
             uid = new mongoose.Types.ObjectId(userId);//conversion of userid string type into object id
                 } else {
             throw new Error("Invalid ObjectId format");
           };
           if(course.studentsEnrolled.includes(uid)){
              return res.status(200).json({
                success:false,
                message:"Student is already enrolled",
              });
           }

      // Add the price of the course to the total amount
      total_amount += course.price
    } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  const options = {
    amount: total_amount * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
  }

  try {
    // Initiate the payment using Razorpay
    const paymentResponse = await instance.orders.create(options)
    console.log(paymentResponse)
    res.json({
      success: true,
      data: paymentResponse,
    })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ success: false, message: "Could not initiate order." })
  }
}

// verify the payment
exports.verifyPayment = async (req, res) => {

  console.log(req.body)
  const razorpay_order_id = req.body?.razorpay_order_id
  const razorpay_payment_id = req.body?.razorpay_payment_id
  const razorpay_signature = req.body?.razorpay_signature
  const courses = req.body?.courses
 console.log("Order ID:", razorpay_order_id);
console.log("Payment ID:", razorpay_payment_id);
console.log("Signature sent:", razorpay_signature);

  const userId = req.user.id

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(200).json({ success: false, message: "Payment Failed" })
  }

  let body = razorpay_order_id + "|" + razorpay_payment_id

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex")

    console.log("Expected Signature:", expectedSignature);

  if (expectedSignature === razorpay_signature) {
    await enrollStudents(courses, userId, res)
    return res.status(200).json({ success: true, message: "Payment Verified" })
  }

  return res.status(200).json({ success: false, message: "Payment Failed" })
}

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body
  
  console.log("This is the body of requqest",req.body)
  const userId = req.user.id

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" })
  }

  try {
    const enrolledStudent = await User.findById(userId)

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    )
  } catch (error) {
    console.log("error in sending mail", error)
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" })
  }
}

// enroll the student in the courses
const enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please Provide Course ID and User ID" })
  }

  for (const courseId of courses) {
    try {
      // Find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      )

      if (!enrolledCourse) {
        return res
          .status(500)
          .json({ success: false, error: "Course not found" })
      }
      console.log("Updated course: ", enrolledCourse)

      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      })
      // Find the student and add the course to their list of enrolled courses
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      )

      console.log("Enrolled student: ", enrolledStudent)
      // Send an email notification to the enrolled student
      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      )

      //console.log("Email sent successfully: ", emailResponse.response)
    } catch (error) {
      console.log(error)
      return res.status(400).json({ success: false, error: error.message })
    }
  }
}













//capture the payment and initate the razorpay order
// exports.capturePayment=async(req,res)=>{
//     //get courseid and user id
//     const{course_id}=req.body;
//     const userId=req.user.id;
//      //validation 
//      //valid course id 
//      if(!course_id){
//         return res.json({
//             status:false,
//             message:"Please provide valid course ID",
//         })
//      }
//      //valid course detaiks
//      let course;
//      try{
//         course=await Course.findById(course_id);
//         if(!course){
//             return res.json({
//                 success:false,
//                 message:"Could not find the course",
//             });
//         }
//         //user already paid for the same course

//         if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
//             const uid = new mongoose.Types.ObjectId(userId);//conversion of userid string type into object id
//                  } else {
//              throw new Error("Invalid ObjectId format");
//            };
//            if(course.studentsEnrolled.includes(uid)){
//               return res.status(200).json({
//                 success:false,
//                 message:"Student is already enrolled",
//               });
//            }

//      }catch(error){
//           console.error(error);
//           return res.status(500).json({
//             success:false,
//             message:error.message,
//           })
//      }
     
//      //create order 
//      const amount=course.price;
//      const currency="INR";

//      const options={
//         amount: amount*100,
//         currency,
//         receipt:Math.random(Date.now()).toString(),
//         notes:{
//             courseId:course_id,
//             userId,
//         }
//      };
//      try{
//          //initatte the payment using razorpay
//          const paymentResponse=await instance.orders.create(options);//i have created the order
//          console.log(paymentResponse);
//            //return response
//          return res.status(200).json({
//             success:true,
//             courseName:course.courseName,
//             courseDescription:course.courseDescription,
//             thumbnail:course.thumbnail,
//             orderId:paymentResponse.id,
//             currency:paymentResponse.currency,
//             amount:paymentResponse.amount,
//          });

//      }catch(error){
//           console.log(error);
//           res.json({
//             success:false,
//             message:"Could not initatethe order",
//           })
//      }
    
// };

// //verify signature of razorpay and server 
//   exports.verifySignature=async(req,res)=>{
//     const webhookSecret="12345678";


//     const signature=req.header("x-razorpay-signature");//razor pay seh aaya hain secret

//     const shasum = crypto.createHmac("sha256",webhookSecret);

//     shasum.update(JSON.stringify(req.body));

//     const digest=shasum.digest("hex");
//     //webhook secret ko convert kiya digest k andar

//     //match webhook secret and signature

//     if(signature===digest){
//       console.log("Payment is authorised");
    

//     //user aur course id abhki baar req seh nhi aayegi kyu ki req frontend seh nhi aayi h razor pay se aayi h
//     //so notes ka istemaal karenge bcoz notes mein humne daala hai
//      const {courseId,userId}=req.body.payload.payment.entity.notes;

//      try{
//          //fullfill the action

//          //find the course and enroll the student in it
//          const enrolledCourse=await Course.findOneAndUpdate(
//           {_id:courseId},
//           {$push:{studentsEnrolled:userId}},
//           {new:true},
//          );

//          if(!enrolledCourse){
//           return res.status(500).json({
//             success:false,
//             message:`Course not found`,
//           });
//          }

//          console.log(enrolledCourse);
          
//          //find the student and add the course to their list of enrolled courses
//          const enrolledStudent=await User.findOneAndUpdate({_id:userId},
//           {$push:{course:courseId}},
//           {new:true},
//          );

//          console.log(enrolledStudent);

//          ////WILL SEND THE MAIL FOR ENROLLMENT!
//          const emailResponse=await mailSender(
//                                          enrolledStudent.email,
//                                          "Congratulations from Codehelp",
//                                          "Congratulaions, u are enboarded into new course",
//          );

//          console.log(emailResponse);

//          return res.status(200).json({
//           success:true,
//           message:"Signature Verified and Course Added",
//          });


//      }catch(error){
//        console.log(error);
//        return res.status(500).json({
//         success:false,
//         message:error.message,
//        });
//      }
// }
// else{
//   return res.status(400).json({
//     success:false,
//     message:"Invalid Request",
//   });
// }
//  };
