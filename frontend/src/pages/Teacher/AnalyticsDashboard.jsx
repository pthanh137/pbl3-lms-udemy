import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  FiDollarSign,
  FiUsers,
  FiBook,
  FiTrendingUp,
  FiStar,
} from 'react-icons/fi';
import { teacherAnalyticsApi } from '../../api/teacherAnalyticsApi';
import { showError } from '../../utils/toast';
import SkeletonCard from '../../components/SkeletonCard';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

const AnalyticsDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [revenueDaily, setRevenueDaily] = useState([]);
  const [enrollDaily, setEnrollDaily] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryRes, revenueRes, enrollRes, performanceRes] = await Promise.all([
          teacherAnalyticsApi.getSummary(),
          teacherAnalyticsApi.getRevenueDaily(30),
          teacherAnalyticsApi.getEnrollmentsDaily(30),
          teacherAnalyticsApi.getCoursePerformance(),
        ]);

        setSummary(summaryRes.data);
        setRevenueDaily(revenueRes.data.results || []);
        setEnrollDaily(enrollRes.data.results || []);
        setPerformance(performanceRes.data.results || []);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        showError('Không thể tải dữ liệu phân tích');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  // Prepare pie chart data
  const pieData = performance.slice(0, 6).map((item) => ({
    name: item.course_title.length > 20 
      ? item.course_title.substring(0, 20) + '...' 
      : item.course_title,
    value: item.revenue,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Bảng phân tích
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Theo dõi hiệu suất khóa học và doanh thu của bạn
          </p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border-t-4 border-indigo-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Tổng doanh thu
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary ? formatCurrency(summary.total_revenue) : '0₫'}
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                <FiDollarSign className="text-indigo-600 dark:text-indigo-400 text-2xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border-t-4 border-green-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Tổng học viên
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary?.total_students || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <FiUsers className="text-green-600 dark:text-green-400 text-2xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border-t-4 border-purple-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Tổng khóa học
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary?.total_courses || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <FiBook className="text-purple-600 dark:text-purple-400 text-2xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border-t-4 border-yellow-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Doanh thu hôm nay
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary ? formatCurrency(summary.today_revenue) : '0₫'}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="text-yellow-600 dark:text-yellow-400 text-2xl" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Line Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Doanh thu (30 ngày)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueDaily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  tickFormatter={(value) => formatCurrency(value)}
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(label) => formatDate(label)}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: '#6366f1', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Enrollments Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Đăng ký (30 ngày)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={enrollDaily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  labelFormatter={(label) => formatDate(label)}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#22c55e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Pie Chart and Performance Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Phân tích doanh thu khóa học
            </h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
                Không có dữ liệu
              </div>
            )}
          </motion.div>

          {/* Performance Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 overflow-x-auto"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Hiệu suất khóa học
            </h2>
            {performance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Tên khóa học
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Doanh thu
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Đăng ký
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Đánh giá
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {performance.map((course, index) => (
                      <tr
                        key={course.course_id}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {course.course_title}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(course.revenue)}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <p className="text-gray-700 dark:text-gray-300">
                            {course.total_enrollments}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <FiStar className="text-yellow-400 fill-yellow-400 text-sm" />
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                              {course.average_rating > 0
                                ? course.average_rating.toFixed(1)
                                : 'N/A'}
                            </span>
                            {course.total_reviews > 0 && (
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                ({course.total_reviews})
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                Không có dữ liệu hiệu suất khóa học
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

