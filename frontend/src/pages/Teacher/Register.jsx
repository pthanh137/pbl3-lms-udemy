import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUserPlus, FiUser, FiMail, FiLock, FiBriefcase } from 'react-icons/fi';
import { authApi } from '../../api/authApi';
import { showSuccess, showError } from '../../utils/toast';

const TeacherRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    bio: '',
    qualification: '',
    skills: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Mật khẩu xác nhận không khớp';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      // Remove confirm_password before sending
      const { confirm_password, ...dataToSend } = formData;
      await authApi.teacherRegister(dataToSend);
      showSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/teacher/login');
    } catch (error) {
      showError(error.response?.data?.error || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUserPlus className="text-white text-2xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Đăng ký Giảng viên
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Tạo tài khoản để bắt đầu giảng dạy</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Họ và tên
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    placeholder="Nhập họ và tên của bạn"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    placeholder="Nhập email của bạn"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mật khẩu (tối thiểu 6 ký tự)
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-white ${
                    errors.password ? 'border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500'
                  }`}
                  placeholder="Nhập mật khẩu của bạn"
                  required
                  minLength={6}
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-white ${
                    errors.confirm_password ? 'border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500'
                  }`}
                  placeholder="Nhập lại mật khẩu của bạn"
                  required
                />
              </div>
              {errors.confirm_password && (
                <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Giới thiệu
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                rows="3"
                placeholder="Giới thiệu về bản thân"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bằng cấp
                </label>
                <div className="relative">
                  <FiBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    placeholder="Bằng cấp của bạn"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kỹ năng
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="Kỹ năng của bạn"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </motion.button>
          </form>

          <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
            Đã có tài khoản?{' '}
            <Link
              to="/teacher/login"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
            >
              Đăng nhập tại đây
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TeacherRegister;
