import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUser, FiCheckCircle, FiClock, FiPlayCircle } from 'react-icons/fi';
import { teacherApi } from '../../api/teacherApi';
import SkeletonList from '../../components/SkeletonList';

const StudentDetail = () => {
  const { id: courseId, studentId } = useParams();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await teacherApi.getStudentDetail(courseId, studentId);
        setStudentData(response.data);
      } catch (error) {
        console.error('Error fetching student detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, studentId]);

  const getStatusBadge = (status) => {
    const badges = {
      completed: {
        label: 'Hoàn thành',
        className: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
      },
      in_progress: {
        label: 'Đang học',
        className: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
      },
      not_started: {
        label: 'Chưa bắt đầu',
        className: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
      },
    };
    return badges[status] || badges.not_started;
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-indigo-50/30 dark:bg-gray-900 pt-24 pb-16">
        <div className="container mx-auto px-6">
          <SkeletonList count={5} />
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-indigo-50/30 dark:bg-gray-900 pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center py-16">
            <p className="text-gray-700 dark:text-gray-300 text-lg">Không tìm thấy dữ liệu học viên.</p>
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {studentData.student_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {studentData.student_name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">{studentData.student_email}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tiến độ tổng thể</div>
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                  {studentData.overall_progress.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Khóa học</div>
                <div className="font-semibold text-gray-900 dark:text-white">{studentData.course_title}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Đăng ký lúc</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(studentData.enrolled_at)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Lần cuối truy cập</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(studentData.last_access)}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chapters Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tiến độ theo chương
            </h2>
          </div>
          {studentData.chapters.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-700 dark:text-gray-300">Không có dữ liệu chương học.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Chương / Bài học
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Tiến độ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Thời gian đã xem
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Lần cuối xem
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {studentData.chapters.map((chapter, index) => {
                    const statusBadge = getStatusBadge(chapter.status);
                    return (
                      <motion.tr
                        key={chapter.lesson_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {chapter.section_title} - {chapter.lesson_title}
                            </div>
                            {chapter.duration_seconds && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Tổng thời gian: {formatTime(chapter.duration_seconds)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-[120px]">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div
                                  className={`h-2.5 rounded-full transition-all duration-300 ${
                                    chapter.progress_percent >= 75
                                      ? 'bg-green-500'
                                      : chapter.progress_percent >= 50
                                      ? 'bg-yellow-500'
                                      : chapter.progress_percent >= 25
                                      ? 'bg-orange-500'
                                      : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(100, chapter.progress_percent)}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white min-w-[50px]">
                              {chapter.progress_percent.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <FiPlayCircle />
                            <span>{formatTime(chapter.watched_seconds)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <FiClock />
                            <span>{formatDate(chapter.last_watched)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.className}`}
                          >
                            {chapter.completed && <FiCheckCircle className="mr-1" />}
                            {statusBadge.label}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;

