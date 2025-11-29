import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLogIn, FiMail, FiLock } from 'react-icons/fi';
import { authApi } from '../../api/authApi';
import useAuthStore from '../../store/useAuthStore';
import { showSuccess, showError } from '../../utils/toast';

const TeacherLogin = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authApi.teacherLogin(formData);
      
      console.log('Login response:', response.data);
      
      // Verify response structure
      if (!response.data || !response.data.access || !response.data.refresh || !response.data.teacher) {
        throw new Error('Invalid response format from server');
      }

      // Call login with correct parameters
      login(
        { access: response.data.access, refresh: response.data.refresh },
        'teacher',
        response.data.teacher
      );

      // Force persist to localStorage immediately
      const store = useAuthStore.getState();
      console.log('Store after login:', {
        accessToken: store.accessToken,
        refreshToken: store.refreshToken,
        role: store.role,
        user: store.user
      });

      // Check role and redirect immediately
      if (store.role === 'teacher') {
        showSuccess('Đăng nhập thành công!');
        navigate('/teacher/dashboard');
        return;
      }

      showSuccess('Login successful!');
      
      // Fallback redirect
      setTimeout(() => {
        navigate('/teacher/dashboard');
      }, 300);
    } catch (error) {
      console.error('Login error:', error);
      showError(error.response?.data?.error || error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiLogIn className="text-white text-2xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Teacher Login</h2>
            <p className="text-gray-600 dark:text-gray-400">Welcome back! Please login to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="Enter your password"
                  required
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
              {loading ? 'Logging in...' : 'Login'}
            </motion.button>
          </form>

          <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/teacher/register"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
            >
              Register here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TeacherLogin;
