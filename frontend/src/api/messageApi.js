import axiosClient from './axiosClient';

export const messageApi = {
  // Get all conversations
  getConversations: () => {
    return axiosClient.get('messages/conversations/');
  },

  // Get conversation detail with messages
  getConversation: (conversationId, page = 1, pageSize = 50) => {
    return axiosClient.get(`messages/conversation/${conversationId}/`, {
      params: { page, page_size: pageSize },
    });
  },

  // Send a message
  sendMessage: (conversationId, content) => {
    return axiosClient.post('messages/send/', {
      conversation_id: conversationId,
      content,
    });
  },

  // Start a private chat
  // For teacher: pass studentId only
  // For student: pass teacherId only
  startPrivateChat: (studentId = null, teacherId = null) => {
    const payload = {};
    if (studentId) {
      payload.student_id = studentId;
    }
    if (teacherId) {
      payload.teacher_id = teacherId;
    }
    return axiosClient.post('messages/start_private/', payload);
  },

  // Broadcast message (teacher only)
  broadcastMessage: (courseId, content) => {
    return axiosClient.post('messages/broadcast/', {
      course_id: courseId,
      content,
    });
  },

  // Teacher-specific endpoints
  getTeacherUnreadCount: () => {
    return axiosClient.get('teacher/messages/unread_count/');
  },

  getEnrolledStudents: () => {
    return axiosClient.get('teacher/messages/enrolled-students/');
  },

  // Get unread count (works for both teacher and student)
  getUnreadCount: () => {
    return axiosClient.get('messages/unread_count/');
  },

  // Mark messages as read in a conversation
  markMessagesRead: (conversationId) => {
    return axiosClient.post('messages/mark_read/', {
      conversation_id: conversationId,
    });
  },
};

