import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { reviewApi } from '../../api/reviewApi';
import SkeletonCard from '../SkeletonCard';
import StarRating from '../StarRating';

const ReviewsCarousel = () => {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestReviews = async () => {
      try {
        const response = await reviewApi.getHighlightReviews();
        setReviews(response.data || []);
      } catch (error) {
        console.error('Error fetching highlight reviews:', error);
        // Fallback to empty array if API fails
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestReviews();
  }, []);

  useEffect(() => {
    if (reviews.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };


  const getInitials = (name) => {
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

  // Show section even if no reviews, but with a message
  // if (reviews.length === 0) {
  //   return null;
  // }

  // Different illustration from WhyChooseUs, but still related to reviews/testimonials
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

          {/* Reviews Carousel */}
          <div className="lg:col-span-3">
            <div className="relative max-w-full mx-auto">
          {/* Carousel Container */}
          <div className="relative h-[400px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                  {reviews.length === 0 ? (
                    <div className="col-span-3 flex items-center justify-center h-full">
                      <p className="text-gray-500 text-lg">Chưa có đánh giá nào</p>
                    </div>
                  ) : (
                    [0, 1, 2].map((offset) => {
                      const reviewIndex = (currentIndex + offset) % reviews.length;
                      const review = reviews[reviewIndex];
                      if (!review) return null;

                      return (
                        <motion.div
                          key={`${review.id}-${offset}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: offset * 0.1 }}
                          className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                        >
                          {/* Avatar & Name */}
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(to bottom right, #0B033C, #6B46C1)' }}>
                              {getInitials(review.student_name)}
                            </div>
                            <div>
                              <h4 className="font-semibold" style={{ color: '#0B033C' }}>
                                {review.student_name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {review.course_title}
                              </p>
                            </div>
                          </div>

                          {/* Rating */}
                          <div className="mb-4">
                            <StarRating rating={review.rating} readOnly size={20} />
                          </div>

                          {/* Comment */}
                          <p className="text-gray-700 leading-relaxed">
                            "{review.comment}"
                          </p>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows - Only show if more than 3 reviews */}
          {reviews.length > 3 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                style={{ color: '#0B033C' }}
                aria-label="Previous review"
              >
                <FiChevronLeft className="text-xl" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                style={{ color: '#0B033C' }}
                aria-label="Next review"
              >
                <FiChevronRight className="text-xl" />
              </button>
            </>
          )}

          {/* Dots Indicator - Only show if more than 3 reviews */}
          {reviews.length > 3 && (
            <div className="flex justify-center gap-2 mt-8">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-8'
                      : 'bg-gray-300'
                  }`}
                  style={{
                    backgroundColor: index === currentIndex ? '#0B033C' : '#CBD5E1'
                  }}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>
          )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsCarousel;

