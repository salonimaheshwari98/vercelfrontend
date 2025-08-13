const mongoose=require("mongoose");

const courseProgress=new mongoose.Schema({
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  courseID:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Course",
  },
  completedVideos:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"SubSection",
    }
  ],
  duration: {
    type: Number, // duration in seconds (or minutes) — you decide the unit
    default: 0,
  },

});
module.exports=mongoose.model("courseProgress",courseProgress);