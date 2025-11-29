import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiBook, FiLogOut, FiSave, FiEye, FiEyeOff } from 'react-icons/fi';
import { authApi } from '../api/authApi';
import { showSuccess, showError } from '../utils/toast';
import useAuthStore from '../store/useAuthStore';
import SkeletonBlock from '../components/SkeletonBlock';

const ChangePassword = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_new_password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.old_password) {
      newErrors.old_password = 'Vui lòng nhập mật khẩu cũ';
    }

    if (!formData.new_password) {
      newErrors.new_password = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.new_password.length < 6) {
      newErrors.new_password = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }

    if (!formData.confirm_new_password) {
      newErrors.confirm_new_password = 'Vui lòng xác nhận mật khẩu mới';
    } else if (formData.new_password !== formData.confirm_new_password) {
      newErrors.confirm_new_password = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      await authApi.changePassword(formData.old_password, formData.new_password);
      showSuccess('Đổi mật khẩu thành công!');
      
      // Clear form
      setFormData({
        old_password: '',
        new_password: '',
        confirm_new_password: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.error || 'Không thể đổi mật khẩu';
      showError(errorMessage);
      
      // Set error for old_password if it's incorrect
      if (errorMessage.includes('không đúng') || errorMessage.includes('incorrect')) {
        setErrors((prev) => ({
          ...prev,
          old_password: errorMessage,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="account-sidebar">
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  {user?.profile_img ? (
                    <img
                      src={user.profile_img}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center border-4 border-indigo-500">
                      <FiUser className="text-white text-4xl" />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  {user?.full_name || 'Người dùng'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.email || ''}
                </p>
              </div>

              <nav className="space-y-2">
                <Link
                  to="/profile"
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === '/profile'
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <FiUser className="text-lg" />
                  <span>Hồ sơ cá nhân</span>
                </Link>
                <Link
                  to="/change-password"
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === '/change-password'
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <FiLock className="text-lg" />
                  <span>Đổi mật khẩu</span>
                </Link>
                <Link
                  to="/student/my-courses"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiBook className="text-lg" />
                  <span>Khóa học của tôi</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <FiLogOut className="text-lg" />
                  <span>Thoát tài khoản</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Đổi mật khẩu
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                {/* Old Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mật khẩu cũ *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.old ? 'text' : 'password'}
                      name="old_password"
                      value={formData.old_password}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white pr-12 ${
                        errors.old_password
                          ? 'border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Nhập mật khẩu cũ"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({ ...prev, old: !prev.old }))
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showPasswords.old ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.old_password && (
                    <p className="text-sm text-red-500 mt-1">{errors.old_password}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mật khẩu mới *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="new_password"
                      value={formData.new_password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white pr-12 ${
                        errors.new_password
                          ? 'border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.new_password && (
                    <p className="text-sm text-red-500 mt-1">{errors.new_password}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Mật khẩu phải có ít nhất 6 ký tự
                  </p>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Xác nhận mật khẩu mới *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirm_new_password"
                      value={formData.confirm_new_password}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white pr-12 ${
                        errors.confirm_new_password
                          ? 'border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          confirm: !prev.confirm,
                        }))
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.confirm_new_password && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.confirm_new_password}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSave />
                    <span>{loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      <style>{`
        .account-sidebar {
          width: 100%;
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0px 4px 12px rgba(0,0,0,0.08);
        }
        .dark .account-sidebar {
          background: #1F2937;
        }
        .account-sidebar a,
        .account-sidebar button {
          display: block;
          width: 100%;
          text-align: left;
        }
        .account-sidebar a.active {
          color: #4f46e5;
        }
        @media (max-width: 1024px) {
          .account-sidebar {
            margin-bottom: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ChangePassword;

