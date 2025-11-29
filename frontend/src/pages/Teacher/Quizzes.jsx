import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHelpCircle,
  FiPlus,
  FiTrash2,
  FiArrowLeft,
  FiEdit,
  FiCheckCircle,
  FiPercent,
} from 'react-icons/fi';
import { teacherApi } from '../../api/teacherApi';
import Swal from 'sweetalert2';

const Quizzes = () => {
  const { id, courseId } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', pass_mark: 70 });
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);

  // Support both route formats: courses/:id/quizzes and quizzes/:courseId
  const actualCourseId = id || courseId;

  useEffect(() => {
    if (actualCourseId) {
      // Reset state when course ID changes
      setQuizzes([]);
      setLoading(true);
      setCourse(null);
      fetchQuizzes();
      fetchCourse();
    }
  }, [actualCourseId]);

  const fetchCourse = async () => {
    try {
      const response = await teacherApi.getCourse(actualCourseId);
      setCourse(response.data);
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      // Ensure courseId is a number
      const courseIdNum = parseInt(actualCourseId);
      if (isNaN(courseIdNum)) {
        console.error('Invalid course ID:', actualCourseId);
        setLoading(false);
        return;
      }
      const response = await teacherApi.getQuizzes(courseIdNum);
      setQuizzes(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await teacherApi.createQuiz({ ...formData, course: parseInt(actualCourseId) });
      Swal.fire('Thành công', 'Đã tạo bài kiểm tra thành công!', 'success');
      setShowForm(false);
      setFormData({ title: '', description: '', pass_mark: 70 });
      fetchQuizzes();
    } catch (error) {
      Swal.fire('Lỗi', error.response?.data?.error || 'Không thể tạo bài kiểm tra', 'error');
    }
  };

  const handleDelete = async (quizId) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: 'Hành động này sẽ xóa bài kiểm tra và tất cả câu hỏi của nó vĩnh viễn!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Có, xóa nó!',
      cancelButtonText: 'Hủy',
    });

    if (result.isConfirmed) {
      try {
        await teacherApi.deleteQuiz(quizId);
        Swal.fire('Đã xóa!', 'Bài kiểm tra đã được xóa.', 'success');
        fetchQuizzes();
      } catch (error) {
        Swal.fire('Lỗi', 'Không thể xóa bài kiểm tra', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải bài kiểm tra...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/teacher/courses')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-colors"
          >
            <FiArrowLeft className="text-lg" />
            <span>Quay lại khóa học</span>
          </motion.button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Quản lý bài kiểm tra
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {course?.title ? (
                  <>
                    Khóa học: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{course.title}</span>
                  </>
                ) : (
                  'Tạo và quản lý bài kiểm tra cho khóa học của bạn'
                )}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 ${
                showForm
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl'
              }`}
            >
              <FiPlus className="text-xl" />
              {showForm ? 'Hủy' : 'Thêm bài kiểm tra mới'}
            </motion.button>
          </div>
        </div>

        {/* Add Quiz Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiHelpCircle className="text-indigo-600" />
              Tạo bài kiểm tra mới
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên bài kiểm tra <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="Ví dụ: Bài kiểm tra Chương 1, Thi cuối kỳ, v.v."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  rows="3"
                  placeholder="Mô tả ngắn gọn về bài kiểm tra..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Điểm đạt (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.pass_mark}
                  onChange={(e) => setFormData({ ...formData, pass_mark: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  min="0"
                  max="100"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Điểm tối thiểu cần đạt để vượt qua (0-100)
                </p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Tạo bài kiểm tra
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ title: '', description: '', pass_mark: 70 });
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Hủy
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Quizzes List */}
        {quizzes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center"
          >
            <div className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                <FiHelpCircle className="text-4xl text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Chưa có bài kiểm tra nào
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                Tạo bài kiểm tra đầu tiên để kiểm tra sự hiểu biết của học viên về nội dung khóa học.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <FiPlus className="text-xl" />
                Tạo bài kiểm tra đầu tiên
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-200"
              >
                {/* Quiz Header */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiHelpCircle className="text-white text-xl" />
                      <span className="text-white font-semibold text-sm">Bài kiểm tra</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                      <FiPercent className="text-white text-xs" />
                      <span className="text-white text-xs font-semibold">{quiz.pass_mark}%</span>
                    </div>
                  </div>
                </div>

                {/* Quiz Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {quiz.title}
                  </h3>
                  {quiz.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {quiz.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <FiCheckCircle className="text-base" />
                    <span>Điểm đạt: {quiz.pass_mark}%</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/teacher/questions/${quiz.id}`)}
                      className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white h-10 rounded-xl shadow-sm hover:shadow-md transition-all"
                    >
                      <FiEdit size={16} />
                      <span className="text-sm font-medium">Câu hỏi</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(quiz.id)}
                      className="flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 h-10 rounded-xl shadow-sm hover:shadow-md transition-all"
                    >
                      <FiTrash2 size={16} />
                      <span className="text-sm font-medium">Xóa</span>
                    </motion.button>
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

export default Quizzes;
