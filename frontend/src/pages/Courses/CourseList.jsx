import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import { publicApi } from '../../api/publicApi';
import useDebounce from '../../hooks/useDebounce';
import SkeletonCard from '../../components/SkeletonCard';
import { formatPrice } from '../../utils/formatPrice';
import { getCourseImage } from '../../utils/getCourseImage';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await publicApi.getCourses();
        setCourses(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Tất cả khóa học
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Khám phá hành trình học tập tiếp theo của bạn
          </p>
        </motion.div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:outline-none text-lg shadow-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 text-lg">Không tìm thấy khóa học.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="relative h-48 overflow-hidden">
                  <div
                    className="w-full h-full absolute inset-0"
                    style={{
                      backgroundImage: `url('${getCourseImage(course.id)}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    {/* Dark overlay nhẹ để text dễ đọc */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
                  </div>
                  {course.level && (
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-indigo-600 dark:text-indigo-400 z-10">
                      {course.level}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  {course.teacher && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
                      Bởi {course.teacher.full_name}
                    </p>
                  )}
                  {course.category && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-4">
                      {course.category.title}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      {(() => {
                        const finalPrice = course.discount_price || course.price;
                        const originalPrice = course.discount_price ? course.price : null;
                        return (
                          <>
                            <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                              {formatPrice(finalPrice)}
                            </p>
                            {originalPrice && (
                              <p className="text-sm text-gray-400 dark:text-gray-500 line-through">
                                {formatPrice(originalPrice)}
                              </p>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <Link
                      to={`/course/${course.id}`}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseList;
