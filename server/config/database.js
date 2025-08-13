const mongoose=require("mongoose");
require("dotenv").config();
exports.connect=()=>{
   mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
   })
   .then(()=>console.log("Db connceted successfully"))
   .catch((error)=>{
    console.log("DB connecetion failed");
    console.error(error);
    process.exit(1);
   })
}