import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiUsers, FiEye, FiBook } from 'react-icons/fi';
import { formatPrice } from '../../utils/formatPrice';
import { getImageUrl } from '../../utils/imageUtils';

const PopularCourses = ({ courses }) => {
  if (!courses || courses.length === 0) {
    return null;
  }

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`text-sm ${
              star <= fullStars
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
          {rating > 0 ? rating.toFixed(1) : 'N/A'}
        </span>
      </div>
    );
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Khóa học phổ biến
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Những khóa học được yêu thích nhất
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.slice(0, 6).map((course, i) => {
            const finalPrice = course.discount_price || course.price;
            const originalPrice = course.discount_price ? course.price : null;
            const discountPercent = course.discount_price
              ? Math.round(((course.price - course.discount_price) / course.price) * 100)
              : 0;

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
              >
                {/* Thumbnail */}
                <Link to={`/course/${course.id}`}>
                  <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
                    {getImageUrl(course.featured_img) ? (
                      <img
                        src={getImageUrl(course.featured_img)}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiBook className="text-6xl text-white/50" />
                      </div>
                    )}
                    {discountPercent > 0 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{discountPercent}%
                      </div>
                    )}
                    {course.level && (
                      <div className="absolute top-3 left-3 bg-black/50 text-white px-3 py-1 rounded-lg text-xs font-semibold">
                        {course.level}
                      </div>
                    )}
                  </div>
                </Link>

                {/* Content */}
                <div className="p-6">
                  {/* Category */}
                  {course.category && (
                    <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full mb-3">
                      {course.category.title}
                    </span>
                  )}

                  {/* Title */}
                  <Link to={`/course/${course.id}`}>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      {course.title}
                    </h3>
                  </Link>

                  {/* Instructor */}
                  {course.teacher && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {course.teacher.full_name}
                    </p>
                  )}

                  {/* Rating & Stats */}
                  <div className="flex items-center gap-4 mb-4">
                    {course.average_rating > 0 && (
                      <div className="flex items-center gap-1">
                        {renderStars(course.average_rating)}
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          ({course.total_reviews || 0})
                        </span>
                      </div>
                    )}
                    {course.total_enrollments > 0 && (
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <FiUsers className="text-sm" />
                        <span className="text-xs">{course.total_enrollments}</span>
                      </div>
                    )}
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(finalPrice)}
                      </span>
                      {originalPrice && (
                        <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                          {formatPrice(originalPrice)}
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/course/${course.id}`}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors text-sm"
                    >
                      Xem khóa học
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Xem tất cả khóa học
            <FiEye />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularCourses;

