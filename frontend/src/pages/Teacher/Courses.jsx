import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiBook,
  FiEdit,
  FiLayers,
  FiHelpCircle,
  FiTrash2,
  FiPlus,
  FiUsers,
  FiTag,
  FiTrendingUp,
} from 'react-icons/fi';
import { teacherApi } from '../../api/teacherApi';
import { publicApi } from '../../api/publicApi';
import Swal from 'sweetalert2';

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, categoriesRes] = await Promise.all([
          teacherApi.getCourses(),
          publicApi.getCategories(),
        ]);
        setCourses(coursesRes.data.results || coursesRes.data);
        setCategories(categoriesRes.data.results || categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: 'Hành động này sẽ xóa khóa học vĩnh viễn!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Có, xóa nó!',
      cancelButtonText: 'Hủy',
    });

    if (result.isConfirmed) {
      try {
        await teacherApi.deleteCourse(id);
        setCourses(courses.filter((c) => c.id !== id));
        Swal.fire('Đã xóa!', 'Khóa học đã được xóa.', 'success');
      } catch (error) {
        Swal.fire('Lỗi', 'Không thể xóa khóa học', 'error');
      }
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.title || 'Chưa phân loại';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getLevelBadgeColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải khóa học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Quản lý khóa học
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Xem, chỉnh sửa và quản lý các khóa học đã xuất bản của bạn
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/teacher/courses/add')}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <FiPlus className="text-xl" />
              Thêm khóa học mới
            </motion.button>
          </div>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center"
          >
            <div className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                <FiBook className="text-4xl text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Chưa có khóa học nào
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                Tạo khóa học đầu tiên để bắt đầu giảng dạy và chia sẻ kiến thức với học viên.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/teacher/courses/add')}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <FiPlus className="text-xl" />
                Tạo khóa học đầu tiên
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-200"
              >
                {/* Thumbnail */}
                <div className="relative h-40 bg-gradient-to-br from-indigo-500 to-purple-600">
                  {course.featured_img ? (
                    <img
                      src={course.featured_img}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <FiBook className="text-6xl text-white opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getLevelBadgeColor(
                        course.level
                      )}`}
                    >
                      {course.level || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  {/* Category Badge */}
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-xs font-semibold">
                      <FiTag className="text-xs" />
                      {getCategoryName(course.category)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 min-h-[3.5rem]">
                    {course.title}
                  </h3>

                  {/* Description Preview */}
                  {course.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <FiUsers className="text-base" />
                      <span>0 học viên</span>
                    </div>
                    {course.views !== undefined && (
                      <div className="flex items-center gap-1">
                        <FiTrendingUp className="text-base" />
                        <span>{course.views || 0} lượt xem</span>
                      </div>
                    )}
                  </div>

                  {/* Price Section */}
                  <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    {course.discount_price ? (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatPrice(course.discount_price)}
                        </span>
                        <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                          {formatPrice(course.price)}
                        </span>
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-xs font-semibold">
                          {Math.round(
                            ((course.price - course.discount_price) / course.price) * 100
                          )}
                          % OFF
                        </span>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(course.price || 0)}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {/* Edit */}
                    <button
                      onClick={() => navigate(`/teacher/courses/${course.id}/edit`)}
                      className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white h-10 rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-105"
                    >
                      <FiEdit size={16} />
                      <span className="text-sm font-medium">Chỉnh sửa</span>
                    </button>

                    {/* Sections */}
                    <button
                      onClick={() => navigate(`/teacher/courses/${course.id}/sections`)}
                      className="flex items-center justify-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 h-10 rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-105"
                    >
                      <FiLayers size={16} />
                      <span className="text-sm font-medium">Phần học</span>
                    </button>

                    {/* Quizzes */}
                    <button
                      onClick={() => navigate(`/teacher/courses/${course.id}/quizzes`)}
                      className="flex items-center justify-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 h-10 rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-105"
                    >
                      <FiHelpCircle size={16} />
                      <span className="text-sm font-medium">Bài kiểm tra</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 h-10 rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-105"
                    >
                      <FiTrash2 size={16} />
                      <span className="text-sm font-medium">Xóa</span>
                    </button>
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

export default Courses;
