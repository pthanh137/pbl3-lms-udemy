import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiStar, FiUsers, FiBook } from 'react-icons/fi';
import { publicApi } from '../../api/publicApi';
import { getImageUrl } from '../../utils/imageUtils';
import SkeletonCard from '../SkeletonCard';

const TopInstructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        const response = await publicApi.getTeachers();
        const teachers = response.data.results || response.data || [];
        
        // Sort by total_students (descending) to get most popular first
        const sortedTeachers = [...teachers].sort((a, b) => {
          const studentsA = a.total_students || 0;
          const studentsB = b.total_students || 0;
          return studentsB - studentsA;
        });
        
        // Limit to top 6 teachers
        setInstructors(sortedTeachers.slice(0, 6));
      } catch (error) {
        console.error('Error fetching instructors:', error);
        // Fallback to empty array if API fails
        setInstructors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

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
        <span className="ml-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

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
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

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
            Giảng viên nổi bật
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Học từ những chuyên gia hàng đầu trong lĩnh vực
          </p>
        </motion.div>

        {instructors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Chưa có giảng viên nào trong hệ thống
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {instructors.map((instructor, index) => {
              const hasImageError = imageErrors[instructor.id];
              const imageUrl = getImageUrl(instructor.profile_img);
              const hasValidImage = imageUrl && !hasImageError;
              
              return (
              <motion.div
                key={instructor.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
              >
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-4">
                  {hasValidImage ? (
                    <img
                      src={imageUrl}
                      alt={instructor.full_name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500"
                      onError={() => {
                        setImageErrors(prev => ({ ...prev, [instructor.id]: true }));
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl border-2 border-indigo-500">
                      {getInitials(instructor.full_name)}
                    </div>
                  )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {instructor.full_name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                    {instructor.bio || instructor.qualification || 'Giảng viên chuyên nghiệp'}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <FiUsers />
                    <span className="text-sm">Học viên</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {(instructor.total_students || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <FiBook />
                    <span className="text-sm">Khóa học</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {instructor.total_courses}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Đánh giá</span>
                  {instructor.average_rating > 0 ? (
                    renderStars(instructor.average_rating)
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">Chưa có đánh giá</span>
                  )}
                </div>
              </div>

              {/* View Courses Button */}
              <Link
                to={`/courses?teacher=${instructor.id}`}
                className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                Xem khóa học
              </Link>
              </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default TopInstructors;

