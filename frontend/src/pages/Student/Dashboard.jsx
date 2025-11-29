import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBook, FiTrendingUp, FiUser, FiAward } from 'react-icons/fi';
import { studentApi } from '../../api/studentApi';
import { certificateApi } from '../../api/certificateApi';
import useAuthStore from '../../store/useAuthStore';
import { getCourseImage } from '../../utils/getCourseImage';
import SkeletonList from '../../components/SkeletonList';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, attemptsRes, certsRes] = await Promise.all([
          studentApi.getMyCourses(),
          studentApi.getQuizAttempts(),
          certificateApi.getMyCertificates().catch(() => ({ data: { results: [] } })),
        ]);
        setCourses(coursesRes.data.results || coursesRes.data);
        setAttempts(attemptsRes.data.results || attemptsRes.data);
        setCertificates(certsRes.data.results || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
        <div className="container mx-auto px-6">
          <SkeletonList count={5} />
        </div>
      </div>
    );
  }

  const passedAttempts = attempts.filter((a) => a.passed).length;
  const avgScore =
    attempts.length > 0
      ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
      : 0;

  return (
    <div className="min-h-screen bg-indigo-50/30 dark:bg-gray-900 pt-24 pb-16">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Bảng điều khiển
          </h1>
          <p className="text-gray-700 dark:text-gray-300 font-medium">Chào mừng trở lại, {user?.full_name}!</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-1 font-medium">Khóa học đã đăng ký</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{courses.length}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                <FiBook className="text-indigo-600 dark:text-indigo-400 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-1 font-medium">Lần làm bài kiểm tra</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{attempts.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="text-purple-600 dark:text-purple-400 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-1 font-medium">Bài kiểm tra đã đạt</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{passedAttempts}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <FiAward className="text-green-600 dark:text-green-400 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-1 font-medium">Điểm trung bình</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {avgScore.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="text-yellow-600 dark:text-yellow-400 text-xl" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enrolled Courses */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Khóa học của tôi
                </h2>
                <Link
                  to="/courses"
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                >
                  Xem thêm
                </Link>
              </div>
              {courses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">
                    Bạn chưa đăng ký khóa học nào.
                  </p>
                  <Link
                    to="/courses"
                    className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Xem khóa học
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.map((course, index) => {
                    // Handle both course object and nested course structure
                    const courseData = course.course || course;
                    const courseId = courseData.id || course.id;
                    const courseTitle = courseData.title || course.title;
                    const courseDescription = courseData.description || course.description;
                    const courseImage = courseData.featured_img || course.featured_img;
                    
                    return (
                    <motion.div
                      key={courseId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div
                        className="w-20 h-20 rounded-lg relative overflow-hidden flex-shrink-0"
                        style={{
                          backgroundImage: `url('${getCourseImage(courseId)}')`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      >
                        <div className="absolute inset-0 bg-black/20"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {courseTitle}
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">
                          {courseDescription}
                        </p>
                      </div>
                      <Link
                        to={`/student/course/${courseId}/content`}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                      >
                        Tiếp tục
                      </Link>
                    </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Quiz Attempts */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Bài kiểm tra gần đây
              </h2>
              {attempts.length === 0 ? (
                <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">Chưa có bài kiểm tra nào.</p>
              ) : (
                <div className="space-y-4">
                  {attempts.slice(0, 5).map((attempt) => (
                    <div
                      key={attempt.id}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-indigo-500"
                    >
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                        {attempt.quiz}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-lg font-bold ${
                            attempt.passed
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {attempt.score}%
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            attempt.passed
                              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                              : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                          }`}
                        >
                          {attempt.passed ? 'Đạt' : 'Không đạt'}
                        </span>
                      </div>
                    </div>
                  ))}
                  <Link
                    to="/student/quiz-attempts"
                    className="block text-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-sm mt-4"
                  >
                    Xem tất cả →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
