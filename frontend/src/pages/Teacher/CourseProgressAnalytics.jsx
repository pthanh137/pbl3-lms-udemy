import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUsers, FiTrendingUp, FiActivity, FiUserX, FiBarChart2 } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { teacherApi } from '../../api/teacherApi';
import SkeletonList from '../../components/SkeletonList';

const CourseProgressAnalytics = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, courseRes] = await Promise.all([
          teacherApi.getCourseAnalytics(courseId),
          teacherApi.getCourse(courseId),
        ]);
        setAnalytics(analyticsRes.data);
        setCourse(courseRes.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const chartData = analytics?.progress_distribution
    ? [
        { name: '0-25%', value: analytics.progress_distribution['0-25'] || 0 },
        { name: '25-50%', value: analytics.progress_distribution['25-50'] || 0 },
        { name: '50-75%', value: analytics.progress_distribution['50-75'] || 0 },
        { name: '75-100%', value: analytics.progress_distribution['75-100'] || 0 },
      ]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-indigo-50/30 dark:bg-gray-900 pt-24 pb-16">
        <div className="container mx-auto px-6">
          <SkeletonList count={5} />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-indigo-50/30 dark:bg-gray-900 pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center py-16">
            <p className="text-gray-700 dark:text-gray-300 text-lg">Không tìm thấy dữ liệu phân tích.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-50/30 dark:bg-gray-900 pt-24 pb-16">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(`/teacher/course/${courseId}/students`)}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-colors"
          >
            <FiArrowLeft />
            <span>Quay lại</span>
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Phân tích tiến độ - {course?.title || analytics.course_title}
            </h1>
            <p className="text-gray-700 dark:text-gray-300">
              Tổng quan về tiến độ học tập của học viên
            </p>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Tổng số học viên</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.total_students}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                <FiUsers className="text-indigo-600 dark:text-indigo-400 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Tiến độ trung bình</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {analytics.avg_course_progress.toFixed(1)}%
                </p>
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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Hoạt động tuần này</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {analytics.active_students_count}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <FiActivity className="text-green-600 dark:text-green-400 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Không hoạt động</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {analytics.inactive_students_count}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <FiUserX className="text-red-600 dark:text-red-400 text-xl" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Progress Distribution Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FiBarChart2 />
              Phân bố tiến độ
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Students by Progress Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Học viên theo tiến độ
            </h2>
            {analytics.students_by_progress.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">Chưa có dữ liệu.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {analytics.students_by_progress.slice(0, 10).map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => navigate(`/teacher/course/${courseId}/student/${student.student_id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {student.student_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {student.student_name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {student.student_email}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {student.overall_progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressColor(student.overall_progress)}`}
                        style={{ width: `${Math.min(100, student.overall_progress)}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseProgressAnalytics;


