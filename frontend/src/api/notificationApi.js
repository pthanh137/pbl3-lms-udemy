import axiosClient from './axiosClient';

export const notificationApi = {
  // Get all notifications for student
  getNotifications: () => {
    return axiosClient.get('student/notifications/');
  },

  // Mark a notification as read
  markNotificationRead: (notificationId) => {
    return axiosClient.post('student/notifications/mark_read/', {
      id: notificationId,
    });
  },

  // Get unread notification count
  getUnreadCount: () => {
    return axiosClient.get('student/notifications/unread_count/');
  },
};

