const Category=require("../models/Category");
function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

//create tag ka handler function

exports.createCategory=async(req,res)=>{
    try{

        //data nikal liya req ki body mein seh
          const {name,description}=req.body

          //validation karna hai
          if(!name|| !description){
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            })
          }

          //create entry in db
          const categoryDetails=await Category.create({
            name:name,
            description:description,//name aur des k andar daaldiya data
          });
          

          return res.status(200).json({
            success:true,
            message:"Category reated successfully",
          })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};

//getAlltags handler fucntion

exports.showAllCategory=async(req,res)=>{
    try{
        const allCategory=await Category.find({}, {name:true, description:true});
        // hum kisi criteria k basis peh find nhi karahe par joh bhi data fetch karahe usmein name and des hona chaiye
        res.status(200).json({
            success:true,
            message:"All tags returned successfully",
            data:allCategory,//saare tags ko successfully return kardiya 
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};

//category page details
exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body

    // Get courses for the specified category
    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: "ratingAndReviews",
      })
      .exec()

    
    // Handle the case when the category is not found
    if (!selectedCategory) {
      console.log("Category not found.")
      return res
        .status(404)
        .json({ success: false, message: "Category not found" })
    }
    // Handle the case when there are no courses
    if (selectedCategory?.courses?.length === 0) {
      console.log("No courses found for the selected category.")
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category.",
      })
    }

    // Get courses for other categories
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    })
    let differentCategory = await Category.findOne(
      categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
        ._id
    )
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec()
    console.log()
    // Get top-selling courses across all categories
    const allCategories = await Category.find()
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate:{
          path:"instructor",
        }
      })
      .exec()
   const allCourses = allCategories.flatMap((category) => category.courses)
  const mostSellingCourses = allCourses
  .filter(course => course) // remove null/undefined
  .sort((a, b) => (b.sold || 0) - (a.sold || 0))
  .slice(0, 10)


    res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}


