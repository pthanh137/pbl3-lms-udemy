import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiBook } from 'react-icons/fi';
import { formatPrice } from '../utils/formatPrice';
import { getImageUrl } from '../utils/imageUtils';
import { getCourseImage } from '../utils/getCourseImage';
import StarRating from './StarRating';

const CourseCard = ({ course }) => {

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
        <div 
          className="relative h-48 overflow-hidden"
          style={{
            backgroundImage: `url('${getCourseImage(course.id)}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Dark overlay nhẹ để text dễ đọc */}
          <div className="absolute inset-0 bg-black/20"></div>
          {!getImageUrl(course.featured_img) && (
            <div className="w-full h-full flex items-center justify-center relative z-10">
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
              <StarRating rating={Math.round(course.average_rating)} readOnly size={16} />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {course.average_rating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({course.total_reviews || 0} đánh giá)
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

