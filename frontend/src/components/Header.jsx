import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiLogOut, FiMenu, FiX, FiSun, FiMoon, FiSearch } from 'react-icons/fi';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';

const Header = () => {
  const navigate = useNavigate();
  const { role, user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg'
          : 'bg-gray-900/80 dark:bg-gray-900/80 backdrop-blur-md'
      }`}
    >
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-2xl font-bold text-white">
              LMS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 flex-1 max-w-2xl mx-8">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm khóa học..."
                className="w-full px-4 py-2 pl-10 pr-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            </form>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`font-bold transition-colors ${
                scrolled
                  ? 'text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-300'
                  : 'text-white hover:text-indigo-300'
              }`}
            >
              Trang chủ
            </Link>
            <Link
              to="/courses"
              className={`font-bold transition-colors ${
                scrolled
                  ? 'text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-300'
                  : 'text-white hover:text-indigo-300'
              }`}
            >
              Khóa học
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                scrolled
                  ? 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  : 'hover:bg-white/20'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <FiSun className={`text-xl ${scrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`} />
              ) : (
                <FiMoon className={`text-xl ${scrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`} />
              )}
            </button>

            {!role ? (
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <button className={`font-bold transition-colors ${
                    scrolled
                      ? 'text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-300'
                      : 'text-white hover:text-indigo-300'
                  }`}>
                    Học viên
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to="/student/login"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-t-lg"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/student/register"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-b-lg"
                    >
                      Đăng ký
                    </Link>
                  </div>
                </div>
                <div className="relative group">
                  <button className={`font-bold transition-colors ${
                    scrolled
                      ? 'text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-300'
                      : 'text-white hover:text-indigo-300'
                  }`}>
                    Giảng viên
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to="/teacher/login"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-t-lg"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/teacher/register"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-b-lg"
                    >
                      Đăng ký
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <button className={`flex items-center space-x-2 font-bold transition-colors ${
                  scrolled
                    ? 'text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-300'
                    : 'text-white hover:text-indigo-300'
                }`}>
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                    <FiUser className="text-white text-sm" />
                  </div>
                  <span>{user?.full_name || 'Người dùng'}</span>
                </button>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link
                    to={role === 'student' ? '/student/dashboard' : '/teacher/dashboard'}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-t-lg"
                  >
                    <FiUser className="text-indigo-600" />
                    <span>Bảng điều khiển</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-b-lg"
                  >
                    <FiLogOut className="text-red-500" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <FiSun className={scrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'} />
              ) : (
                <FiMoon className={scrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'} />
              )}
            </button>
            <button
              className={`${scrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-4 space-y-2 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg"
          >
            <Link
              to="/"
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link
              to="/courses"
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Khóa học
            </Link>
            {!role ? (
              <>
                <Link
                  to="/student/login"
                  className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng nhập Học viên
                </Link>
                <Link
                  to="/teacher/login"
                  className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng nhập Giảng viên
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={role === 'student' ? '/student/dashboard' : '/teacher/dashboard'}
                  className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Bảng điều khiển
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  Đăng xuất
                </button>
              </>
            )}
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
};

export default Header;
