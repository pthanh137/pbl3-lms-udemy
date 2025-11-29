import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBell, FiCheck } from 'react-icons/fi';
import { notificationApi } from '../../api/notificationApi';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Swal from 'sweetalert2';

const StudentNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadTotal, setUnreadTotal] = useState(0);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    
    // Poll for new notifications every 10 seconds
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationApi.getNotifications();
      console.log('Notifications response:', response.data);
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: error.response?.data?.error || 'Không thể tải thông báo',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationApi.getUnreadCount();
      setUnreadTotal(response.data.unread_total || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await notificationApi.markNotificationRead(notification.id);
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
        setUnreadTotal((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể đánh dấu thông báo là đã đọc',
        });
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.is_read);
      await Promise.all(
        unreadNotifications.map((n) => notificationApi.markNotificationRead(n.id))
      );
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadTotal(0);
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Đã đánh dấu tất cả thông báo là đã đọc',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể đánh dấu tất cả thông báo',
      });
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50/30 dark:bg-gray-900 pt-24 pb-16">
      <div className="container mx-auto px-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                <FiBell className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Thông báo
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {unreadTotal > 0
                    ? `Bạn có ${unreadTotal} thông báo chưa đọc`
                    : 'Không có thông báo mới'}
                </p>
              </div>
            </div>
            {unreadTotal > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <FiCheck />
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">Đang tải...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <FiBell className="text-6xl text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Chưa có thông báo nào
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    !notification.is_read
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                      : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className={`text-lg ${
                            !notification.is_read
                              ? 'font-bold text-gray-900 dark:text-white'
                              : 'font-semibold text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.is_read && (
                          <span className="bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                            !
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm mb-2 ${
                          !notification.is_read
                            ? 'font-medium text-gray-700 dark:text-gray-300'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {notification.message}
                      </p>
                      {notification.course && (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-2">
                          Khóa học: {notification.course.title}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {notification.created_at && (
                          <>
                            {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm', {
                              locale: vi,
                            })}{' '}
                            ({formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: vi,
                            })})
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentNotifications;

