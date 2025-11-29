import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHelpCircle,
  FiPlus,
  FiTrash2,
  FiArrowLeft,
  FiEdit,
  FiHash,
  FiList,
} from 'react-icons/fi';
import { teacherApi } from '../../api/teacherApi';
import Swal from 'sweetalert2';

const Questions = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [formData, setFormData] = useState({ question_text: '', order: 0 });
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    if (quizId) {
      fetchQuestions();
      fetchQuiz();
    }
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await teacherApi.getQuiz(quizId);
      setQuiz(response.data);
    } catch (error) {
      console.error('Error fetching quiz:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await teacherApi.getQuestions(quizId);
      setQuestions(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData, quiz: parseInt(quizId) };
      
      if (editingQuestionId) {
        await teacherApi.updateQuestion(editingQuestionId, submitData);
        Swal.fire('Thành công', 'Đã cập nhật câu hỏi thành công!', 'success');
      } else {
        await teacherApi.createQuestion(submitData);
        Swal.fire('Thành công', 'Đã tạo câu hỏi thành công!', 'success');
      }
      
      setShowForm(false);
      setEditingQuestionId(null);
      setFormData({ question_text: '', order: 0 });
      fetchQuestions();
    } catch (error) {
      Swal.fire('Lỗi', error.response?.data?.error || (editingQuestionId ? 'Không thể cập nhật câu hỏi' : 'Không thể tạo câu hỏi'), 'error');
    }
  };

  const handleEdit = async (questionId) => {
    try {
      const response = await teacherApi.getQuestion(questionId);
      const question = response.data;
      setFormData({
        question_text: question.question_text || '',
        order: question.order || 0
      });
      setEditingQuestionId(questionId);
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      Swal.fire('Lỗi', 'Không thể tải thông tin câu hỏi', 'error');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingQuestionId(null);
    setFormData({ question_text: '', order: 0 });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: 'Hành động này sẽ xóa câu hỏi và tất cả các lựa chọn của nó vĩnh viễn!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Có, xóa nó!',
      cancelButtonText: 'Hủy',
    });

    if (result.isConfirmed) {
      try {
        await teacherApi.deleteQuestion(id);
        Swal.fire('Đã xóa!', 'Câu hỏi đã được xóa.', 'success');
        fetchQuestions();
      } catch (error) {
        Swal.fire('Lỗi', 'Không thể xóa câu hỏi', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải câu hỏi...</p>
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
            onClick={() => {
              if (quiz?.course) {
                navigate(`/teacher/courses/${quiz.course}/quizzes`);
              } else {
                navigate('/teacher/courses');
              }
            }}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-colors"
          >
            <FiArrowLeft className="text-lg" />
            <span>Quay lại bài kiểm tra</span>
          </motion.button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Quản lý câu hỏi
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {quiz?.title ? (
                  <>
                    Bài kiểm tra: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{quiz.title}</span>
                  </>
                ) : (
                  'Tạo và quản lý câu hỏi cho bài kiểm tra'
                )}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (showForm) {
                  handleCancel();
                } else {
                  setShowForm(true);
                  setEditingQuestionId(null);
                  setFormData({ question_text: '', order: 0 });
                }
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 ${
                showForm
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl'
              }`}
            >
              <FiPlus className="text-xl" />
              {showForm ? 'Hủy' : 'Thêm câu hỏi mới'}
            </motion.button>
          </div>
        </div>

        {/* Add Question Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiHelpCircle className="text-indigo-600" />
              {editingQuestionId ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi mới'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nội dung câu hỏi <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.question_text}
                  onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  rows="4"
                  placeholder="Nhập nội dung câu hỏi..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Thứ tự <span className="text-gray-500 text-xs">(Thứ tự hiển thị trong bài kiểm tra)</span>
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="flex gap-3">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {editingQuestionId ? 'Cập nhật câu hỏi' : 'Tạo câu hỏi'}
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Hủy
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Questions List */}
        {questions.length === 0 ? (
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
                Chưa có câu hỏi nào
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                Tạo câu hỏi đầu tiên để bắt đầu xây dựng bài kiểm tra của bạn.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowForm(true);
                  setEditingQuestionId(null);
                  setFormData({ question_text: '', order: 0 });
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <FiPlus className="text-xl" />
                Tạo câu hỏi đầu tiên
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questions
              .sort((a, b) => a.order - b.order)
              .map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-200"
                >
                  {/* Question Header */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FiHelpCircle className="text-white text-xl" />
                        <span className="text-white font-semibold text-sm">
                          Câu hỏi #{question.order || index + 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-3 min-h-[4.5rem]">
                      {question.question_text}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <FiHash className="text-base" />
                      <span>Thứ tự: {question.order || 0}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/teacher/options/${question.id}`)}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white h-10 rounded-xl shadow-sm hover:shadow-md transition-all"
                      >
                        <FiList size={16} />
                        <span className="text-sm font-medium">Lựa chọn</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(question.id)}
                        className="flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-600 h-10 rounded-xl shadow-sm hover:shadow-md transition-all"
                      >
                        <FiEdit size={16} />
                        <span className="text-sm font-medium">Sửa</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(question.id)}
                        className="col-span-2 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 h-10 rounded-xl shadow-sm hover:shadow-md transition-all"
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

export default Questions;



