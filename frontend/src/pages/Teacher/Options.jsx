import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCheckCircle,
  FiXCircle,
  FiPlus,
  FiTrash2,
  FiArrowLeft,
  FiEdit,
  FiList,
} from 'react-icons/fi';
import { teacherApi } from '../../api/teacherApi';
import Swal from 'sweetalert2';

const Options = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const [options, setOptions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOptionId, setEditingOptionId] = useState(null);
  const [formData, setFormData] = useState({ option_text: '', is_correct: false });
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);

  useEffect(() => {
    if (questionId) {
      fetchOptions();
      fetchQuestion();
    }
  }, [questionId]);

  const fetchQuestion = async () => {
    try {
      const response = await teacherApi.getQuestion(questionId);
      setQuestion(response.data);
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  };

  const fetchOptions = async () => {
    try {
      const response = await teacherApi.getOptions(questionId);
      setOptions(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData, question: parseInt(questionId) };
      
      if (editingOptionId) {
        await teacherApi.updateOption(editingOptionId, submitData);
        Swal.fire('Thành công', 'Đã cập nhật lựa chọn thành công!', 'success');
      } else {
        await teacherApi.createOption(submitData);
        Swal.fire('Thành công', 'Đã tạo lựa chọn thành công!', 'success');
      }
      
      setShowForm(false);
      setEditingOptionId(null);
      setFormData({ option_text: '', is_correct: false });
      fetchOptions();
    } catch (error) {
      Swal.fire('Lỗi', error.response?.data?.error || (editingOptionId ? 'Không thể cập nhật lựa chọn' : 'Không thể tạo lựa chọn'), 'error');
    }
  };

  const handleEdit = async (optionId) => {
    try {
      const response = await teacherApi.getOption(optionId);
      const option = response.data;
      setFormData({
        option_text: option.option_text || '',
        is_correct: option.is_correct || false
      });
      setEditingOptionId(optionId);
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      Swal.fire('Lỗi', 'Không thể tải thông tin lựa chọn', 'error');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingOptionId(null);
    setFormData({ option_text: '', is_correct: false });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: 'Hành động này sẽ xóa lựa chọn này vĩnh viễn!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Có, xóa nó!',
      cancelButtonText: 'Hủy',
    });

    if (result.isConfirmed) {
      try {
        await teacherApi.deleteOption(id);
        Swal.fire('Đã xóa!', 'Lựa chọn đã được xóa.', 'success');
        fetchOptions();
      } catch (error) {
        Swal.fire('Lỗi', 'Không thể xóa lựa chọn', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải lựa chọn...</p>
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
            onClick={() => navigate(`/teacher/questions/${questionId}`)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-colors"
          >
            <FiArrowLeft className="text-lg" />
            <span>Quay lại câu hỏi</span>
          </motion.button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Quản lý lựa chọn
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {question?.question_text ? (
                  <>
                    Câu hỏi: <span className="font-semibold text-indigo-600 dark:text-indigo-400 line-clamp-2">{question.question_text}</span>
                  </>
                ) : (
                  'Tạo và quản lý các lựa chọn cho câu hỏi'
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
                  setEditingOptionId(null);
                  setFormData({ option_text: '', is_correct: false });
                }
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 ${
                showForm
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl'
              }`}
            >
              <FiPlus className="text-xl" />
              {showForm ? 'Hủy' : 'Thêm lựa chọn mới'}
            </motion.button>
          </div>
        </div>

        {/* Add Option Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiList className="text-indigo-600" />
              {editingOptionId ? 'Chỉnh sửa lựa chọn' : 'Tạo lựa chọn mới'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nội dung lựa chọn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.option_text}
                  onChange={(e) => setFormData({ ...formData, option_text: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="Nhập nội dung lựa chọn..."
                  required
                />
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                <input
                  type="checkbox"
                  id="is_correct"
                  checked={formData.is_correct}
                  onChange={(e) => setFormData({ ...formData, is_correct: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                />
                <label htmlFor="is_correct" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex items-center gap-2">
                  {formData.is_correct ? (
                    <FiCheckCircle className="text-green-600 text-lg" />
                  ) : (
                    <FiXCircle className="text-gray-400 text-lg" />
                  )}
                  <span>Đây là đáp án đúng</span>
                </label>
              </div>
              <div className="flex gap-3">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {editingOptionId ? 'Cập nhật lựa chọn' : 'Tạo lựa chọn'}
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

        {/* Options List */}
        {options.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center"
          >
            <div className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                <FiList className="text-4xl text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Chưa có lựa chọn nào
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                Tạo lựa chọn đầu tiên để học viên có thể trả lời câu hỏi này.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowForm(true);
                  setEditingOptionId(null);
                  setFormData({ option_text: '', is_correct: false });
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <FiPlus className="text-xl" />
                Tạo lựa chọn đầu tiên
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {options.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 overflow-hidden hover:shadow-xl transition-all duration-200 ${
                  option.is_correct
                    ? 'border-green-500 dark:border-green-400'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {/* Option Header */}
                <div className={`p-4 ${
                  option.is_correct
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                    : 'bg-gradient-to-r from-gray-400 to-gray-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {option.is_correct ? (
                        <FiCheckCircle className="text-white text-xl" />
                      ) : (
                        <FiXCircle className="text-white text-xl" />
                      )}
                      <span className="text-white font-semibold text-sm">
                        {option.is_correct ? 'Đáp án đúng' : 'Lựa chọn'}
                      </span>
                    </div>
                    {option.is_correct && (
                      <span className="px-2 py-1 bg-white/20 rounded-full text-white text-xs font-semibold">
                        ✓
                      </span>
                    )}
                  </div>
                </div>

                {/* Option Content */}
                <div className="p-6">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4 line-clamp-3 min-h-[4.5rem]">
                    {option.option_text}
                  </p>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEdit(option.id)}
                      className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white h-10 rounded-xl shadow-sm hover:shadow-md transition-all"
                    >
                      <FiEdit size={16} />
                      <span className="text-sm font-medium">Sửa</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(option.id)}
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

export default Options;



