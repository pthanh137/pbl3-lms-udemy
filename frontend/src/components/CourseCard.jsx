import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiUser, FiBook } from 'react-icons/fi';
import { formatPrice } from '../utils/formatPrice';
import { getImageUrl } from '../utils/imageUtils';

const CourseCard = ({ course }) => {
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`text-sm ${
              star <= fullStars
                ? 'text-yellow-400 fill-yellow-400'
                : star === fullStars + 1 && hasHalfStar
                ? 'text-yellow-400 fill-yellow-400 opacity-50'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const finalPrice = course.discount_price || course.price;
  const originalPrice = course.discount_price ? course.price : null;
  const discountPercent = course.discount_price 
    ? Math.round(((course.price - course.discount_price) / course.price) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-200"
    >
      <Link to={`/course/${course.id}`}>
        {/* Thumbnail */}
        <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
          {getImageUrl(course.featured_img) ? (
            <img
              src={getImageUrl(course.featured_img)}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiBook className="text-6xl text-white/50" />
            </div>
          )}
          {discountPercent > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
              -{discountPercent}%
            </div>
          )}
          {course.level && (
            <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded-lg text-xs font-semibold">
              {course.level}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          {course.category && (
            <span className="inline-block px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full mb-2">
              {course.category.title}
            </span>
          )}

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[3.5rem]">
            {course.title}
          </h3>

          {/* Instructor */}
          {course.teacher && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {course.teacher.full_name}
            </p>
          )}

          {/* Rating */}
          {course.average_rating > 0 && (
            <div className="flex items-center gap-2 mb-3">
              {renderStars(course.average_rating)}
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {course.average_rating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({course.total_reviews || 0})
              </span>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
            {course.total_enrollments > 0 && (
              <div className="flex items-center gap-1">
                <FiUser />
                <span>{course.total_enrollments} học viên</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {formatPrice(finalPrice)}
              </span>
              {originalPrice && (
                <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CourseCard;

