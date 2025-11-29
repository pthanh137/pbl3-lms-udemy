import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { publicApi } from '../../api/publicApi';
import SkeletonCard from '../SkeletonCard';
import StarRating from '../StarRating';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import './ReviewsCarousel.css';

const ReviewsCarousel = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null);

  useEffect(() => {
    const fetchLatestReviews = async () => {
      try {
        const response = await publicApi.getHomepageReviews();
        const fetchedReviews = response.data || [];
        
        // Đảm bảo có đủ reviews để loop mượt
        // Nếu chỉ có 1 review, duplicate thành 6 để đảm bảo loop mượt
        // Nếu có 2 reviews, duplicate mỗi cái 2 lần để có 6 reviews
        // Nếu có >= 3 reviews, chỉ lấy reviews thật (không duplicate)
        if (fetchedReviews.length === 1) {
          const singleReview = fetchedReviews[0];
          setReviews([
            { ...singleReview, id: `${singleReview.id}-dup-1` },
            { ...singleReview, id: `${singleReview.id}-dup-2` },
            { ...singleReview, id: `${singleReview.id}-dup-3` },
            { ...singleReview, id: `${singleReview.id}-dup-4` },
            { ...singleReview, id: `${singleReview.id}-dup-5` },
            { ...singleReview, id: `${singleReview.id}-dup-6` }
          ]);
        } else if (fetchedReviews.length === 2) {
          // Duplicate mỗi review 2 lần để có 6 reviews (đủ để loop mượt)
          const duplicated = [
            ...fetchedReviews,
            { ...fetchedReviews[0], id: `${fetchedReviews[0].id}-dup-1` },
            { ...fetchedReviews[1], id: `${fetchedReviews[1].id}-dup-1` },
            { ...fetchedReviews[0], id: `${fetchedReviews[0].id}-dup-2` },
            { ...fetchedReviews[1], id: `${fetchedReviews[1].id}-dup-2` }
          ];
          setReviews(duplicated);
        } else if (fetchedReviews.length >= 3) {
          // Chỉ lấy reviews thật, loại bỏ các duplicate (nếu có)
          const realReviews = fetchedReviews.filter(review => 
            !review.id || !review.id.toString().includes('-dup-')
          );
          setReviews(realReviews);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error('Error fetching homepage reviews:', error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestReviews();
  }, []);


  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const illustrationUrl = 'https://illustrations.popsy.co/amber/testimonials.svg';
  const fallbackIllustration = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=600&fit=crop&q=80';

  return (
    <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#EFFBFF' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#0B033C' }}>
            Học viên nói gì về chúng tôi?
          </h2>
          <p className="text-xl text-gray-700">
            Những phản hồi chân thật từ cộng đồng học viên
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          {/* Illustration Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block lg:col-span-2"
          >
            <div className="relative bg-white rounded-3xl p-6 shadow-2xl">
              <img
                src={illustrationUrl}
                alt="Student reviews illustration"
                className="w-full h-auto rounded-2xl"
                style={{ minHeight: '400px', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.src = fallbackIllustration;
                  e.target.style.objectFit = 'cover';
                }}
              />
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-400 rounded-full opacity-20 blur-2xl"></div>
            </div>
          </motion.div>

          {/* Reviews Swiper */}
          <div className="lg:col-span-3">
            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <p className="text-gray-500 text-lg mb-2">Chưa có đánh giá nào</p>
                <p className="text-gray-400 text-sm">Hãy là người đầu tiên đánh giá khóa học!</p>
              </div>
            ) : (
              <div className="review-slider-container">
                <Swiper
                  modules={[Navigation, Autoplay]}
                  spaceBetween={24}
                  loop={reviews.length >= 3}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }}
                  navigation={{
                    prevEl: ".review-btn-prev",
                    nextEl: ".review-btn-next",
                  }}
                  onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                  }}
                  breakpoints={{
                    0: {
                      slidesPerView: 1,
                      spaceBetween: 16,
                    },
                    640: {
                      slidesPerView: 1,
                      spaceBetween: 16,
                    },
                    768: {
                      slidesPerView: 2,
                      spaceBetween: 20,
                    },
                    1024: {
                      slidesPerView: 3,
                      spaceBetween: 24,
                    },
                  }}
                  className="reviews-swiper"
                >
                  {reviews.map((review) => (
                    <SwiperSlide key={review.id}>
                      <div className="review-card">
                        {/* Avatar & Name */}
                        <div className="review-header">
                          <div className="avatar-circle">
                            {getInitials(review.student_name)}
                          </div>
                          <div className="review-header-info">
                            <strong className="review-student-name">
                              {review.student_name || 'Anonymous'}
                            </strong>
                            <small className="review-course-title">
                              {review.course_title || 'Khóa học'}
                            </small>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="review-stars">
                          <StarRating rating={review.rating} readOnly size={18} />
                        </div>

                        {/* Comment */}
                        {review.comment ? (
                          <p className="review-comment">
                            "{review.comment}"
                          </p>
                        ) : (
                          <p className="review-comment text-gray-400 italic">
                            Không có bình luận
                          </p>
                        )}

                        {/* Date */}
                        {review.created_at && (
                          <small className="review-date">
                            {formatDistanceToNow(new Date(review.created_at), {
                              addSuffix: true,
                              locale: vi,
                            })}
                          </small>
                        )}
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Navigation Buttons */}
                <div className="review-nav">
                  <button className="review-btn-prev arrow-btn">‹</button>
                  <button className="review-btn-next arrow-btn">›</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsCarousel;
