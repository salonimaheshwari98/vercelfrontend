import React, { useEffect, useState } from "react";
import ReactStars from "react-rating-stars-component";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import "../../App.css";
import { FaStar } from "react-icons/fa";
import { Pagination, Autoplay, FreeMode } from "swiper/modules";
import { apiConnector } from "../../services/apiConnectorFixed";
import { ratingsEndpoints } from "../../services/apis";

function ReviewSlider() {
  const [reviews, setReviews] = useState([]);
  const truncateWords = 15;

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiConnector(
          "GET",
          ratingsEndpoints.REVIEWS_DETAILS_API
        );
        if (data?.success && Array.isArray(data.data)) {
          setReviews(data.data);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
        setReviews([]);
      }
    })();
  }, []);

  // Duplicate slides if fewer than 4 to enable loop
  const displayReviews =
    reviews.length > 0 && reviews.length < 4 ? [...reviews, ...reviews] : reviews;

  // Minimal fallback reviews to test sliding (remove if API works)
  const fallbackReviews = [
    {
      _id: "1",
      user: { firstName: "Test", lastName: "User", image: "" },
      course: { courseName: "Sample Course" },
      review: "This is a sample review text for testing the slider component.",
      rating: 4.5,
    },
    {
      _id: "2",
      user: { firstName: "Jane", lastName: "Doe", image: "" },
      course: { courseName: "Another Course" },
      review: "Another review to check multiple slides.",
      rating: 3.8,
    },
    {
      _id: "3",
      user: { firstName: "John", lastName: "Smith", image: "" },
      course: { courseName: "Course Three" },
      review: "Great course with excellent content!",
      rating: 5.0,
    },
  ];

  const slidesToUse = displayReviews.length > 0 ? displayReviews : fallbackReviews;

  return (
    <div className="text-white">
      <div className="my-[50px] w-full max-w-maxContentTab lg:max-w-maxContent">
        <Swiper
          loop={slidesToUse.length >= 4}
          spaceBetween={25}
          freeMode={true}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          breakpoints={{
            320: { slidesPerView: Math.min(slidesToUse.length, 1), slidesPerGroup: 1 },
            640: { slidesPerView: Math.min(slidesToUse.length, 2), slidesPerGroup: 2 },
            1024: { slidesPerView: Math.min(slidesToUse.length, 3), slidesPerGroup: 3 },
            1280: { slidesPerView: Math.min(slidesToUse.length, 4), slidesPerGroup: 4 },
          }}
          modules={[Pagination, Autoplay, FreeMode]}
          className="w-full"
        >
          {slidesToUse.map((review, i) => {
            const firstName = review?.user?.firstName || "User";
            const lastName = review?.user?.lastName || "";
            const userImage =
              review?.user?.image ||
              `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`;

            // Safe split for review text
            const reviewText = review?.review || "";
            const words = reviewText.split(" ");
            const displayedReview =
              words.length > truncateWords
                ? words.slice(0, truncateWords).join(" ") + " ..."
                : reviewText;

            return (
              <SwiperSlide key={review._id || i}>
                <div className="flex flex-col gap-3 bg-richblack-800 p-3 text-[14px] text-richblack-25 rounded-md min-h-[200px] overflow-hidden">
                  <div className="flex items-center gap-4">
                    <img
                      src={userImage}
                      alt={`${firstName} ${lastName}`}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <h1 className="font-semibold text-richblack-5">{`${firstName} ${lastName}`}</h1>
                      <h2 className="text-[12px] font-medium text-richblack-500">
                        {review?.course?.courseName || "Course Name"}
                      </h2>
                    </div>
                  </div>
                  <p className="font-medium text-richblack-25">{displayedReview}</p>
                  <div className="flex items-center gap-2">
                    {/* <h3 className="font-semibold text-yellow-100">{review.rating.toFixed(1)}</h3>
                    <ReactStars
                      count={5}
                      value={review.rating}
                      size={20}
                      edit={false}
                      activeColor="#ffd700"
                      emptyIcon={<FaStar />}
                      fullIcon={<FaStar />}
                    /> */}
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
}

export default ReviewSlider;
