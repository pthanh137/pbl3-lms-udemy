import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  FiHome,
  FiBook,
  FiFileText,
  FiUser,
  FiLock,
  FiLogOut,
  FiBarChart2,
  FiUsers,
  FiMessageCircle,
} from 'react-icons/fi';
import useAuthStore from '../store/useAuthStore';
import { messageApi } from '../api/messageApi';
import Swal from 'sweetalert2';

// Teacher Sidebar Component
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count every 10 seconds (for teachers)
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await messageApi.getTeacherUnreadCount();
        setUnreadCount(response.data.unread_total || response.data.unread_count || 0);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn muốn đăng xuất?',
      text: 'Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng hệ thống.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Có, đăng xuất',
      cancelButtonText: 'Hủy',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      logout();
      navigate('/');
      Swal.fire({
        title: 'Đã đăng xuất!',
        text: 'Bạn đã đăng xuất thành công.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const menuItems = [
    { 
      icon: FiHome, 
      label: 'Bảng điều khiển', 
      path: '/teacher/dashboard',
      exact: true
    },
    { 
      icon: FiBarChart2, 
      label: 'Phân tích', 
      path: '/teacher/analytics',
      exact: true
    },
    { 
      icon: FiBook, 
      label: 'Quản lý khóa học', 
      path: '/teacher/courses',
      exact: true
    },
    { 
      icon: FiUsers, 
      label: 'Theo dõi tiến độ học viên', 
      path: '/teacher/student-progress',
      exact: false,
      matchPattern: (path) => path.startsWith('/teacher/course/') && path.includes('/students')
    },
    { 
      icon: FiMessageCircle, 
      label: 'Tin nhắn', 
      path: '/teacher/messages',
      exact: false,
      matchPattern: (path) => path.startsWith('/teacher/messages') || path.startsWith('/messages/'),
      badge: unreadCount > 0 ? unreadCount : null
    },
    { 
      icon: FiUser, 
      label: 'Cài đặt hồ sơ', 
      path: '/teacher/profile',
      exact: true
    },
    { 
      icon: FiLock, 
      label: 'Đổi mật khẩu', 
      path: '/teacher/change-password',
      exact: true
    },
  ];

  const checkIsActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    if (item.matchPattern) {
      return item.matchPattern(location.pathname);
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <motion.aside
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      className="teacher-sidebar-modern fixed left-0 top-0 w-[260px] h-screen bg-gray-900 dark:bg-black text-white rounded-r-2xl shadow-2xl transition-colors duration-300"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '260px',
        height: '100vh',
        zIndex: 9999,
        pointerEvents: 'auto'
      }}
    >
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">L</span>
          </div>
          <span className="text-xl font-bold">Giảng viên</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = checkIsActive(item);
            return (
              <motion.div
                key={`${item.label}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
                style={{ position: 'relative', zIndex: 1, pointerEvents: 'none' }}
              >
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 relative cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-900 hover:text-white'
                  }`}
                  style={{ 
                    position: 'relative', 
                    zIndex: 10,
                    pointerEvents: 'auto',
                    cursor: 'pointer'
                  }}
                >
                  <Icon className="text-lg" />
                  <span className="font-medium">
                    {item.badge && item.badge > 0 ? `${item.label} (${item.badge > 99 ? '99+' : item.badge})` : item.label}
                  </span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}

          <div className="pt-8 border-t border-gray-800 dark:border-gray-700 mt-8">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 w-full"
            >
              <FiLogOut className="text-lg" />
              <span className="font-medium">Đăng xuất</span>
            </button>
          </div>
        </nav>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
