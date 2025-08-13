import React from 'react'
import Logo1 from "../../../assets/TimeLineLogo/Logo1.svg"
import Logo2 from "../../../assets/TimeLineLogo/Logo2.svg"
import Logo3 from "../../../assets/TimeLineLogo/Logo3.svg"
import Logo4 from "../../../assets/TimeLineLogo/Logo4.svg"
import timelineimage from "../../../assets/Images/TimelineImage.png"
const timeline = [
  {
    Logo: Logo1,
    heading: "Leadership",
    Description: "Fully committed to the success company",
  },
  {
    Logo: Logo2,
    heading: "Responsibility",
    Description: "Fully committed to the success company",
  },
  {
    Logo: Logo3,
    heading: "Leadership",
    Description: "Fully committed to the success company",
  },
  {
    Logo: Logo4,
    heading: "Leadership",
    Description: "Fully committed to the success company",
  },
]

const TimeLineSection = () => {
  return (
    <div className="flex justify-center px-6 py-10 ">
      <div className="flex flex-row items-start gap-10 max-w-[1000px] w-full">

        {/* Timeline Content */}
        <div className="w-[45%] flex flex-col gap-8">
          {timeline.map((element, index) => (
            <div key={index} className="flex flex-row gap-4 items-start">
              <div className="w-[50px] h-[50px]  flex items-center justify-center rounded-full shadow-md">
                <img src={element.Logo} alt={`Logo ${index + 1}`} className="w-[30px] h-[30px]" />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-richblack-300">{element.heading}</h2>
                <p className="text-sm text-richblack-300">{element.Description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right section if needed */}
        <div className="relative shadow-blue-200"> 
            <img src={timelineimage} alt="timelineimage"
            className='shadow-white object-cover h-fit'/>
 
           <div className='absolute  bg-caribbeangreen-700 flex flex-row text-white uppercase py-7 left-[50%] translate-x-[-50%] translate-y-[-50%]'>
               <div className='flex flex-row gap-5 items-center border-r border-caribbeangreen-300 px-7'>
                <p className='3xl font-bold'>10</p>
                <p className='text-caribbeangreen-300 text-sm'>Years of Experience</p>
               </div>
               <div className='flex gap-5 items-center px-7'>
                <p className='3xl font-bold'>250</p>
                <p className='text-caribbeangreen-300 text-sm'>Type of Courses</p>
               </div>
           </div>

        </div>

      </div>
    </div>
  )
}

export default TimeLineSection
