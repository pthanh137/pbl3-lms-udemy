import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiSearch, FiUser, FiUsers, FiX, FiMessageCircle } from 'react-icons/fi';
import { messageApi } from '../../api/messageApi';
import { teacherApi } from '../../api/teacherApi';
import useAuthStore from '../../store/useAuthStore';
import Swal from 'sweetalert2';

const TeacherMessages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastCourseId, setBroadcastCourseId] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [courses, setCourses] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [showStudentList, setShowStudentList] = useState(false);
  const messagesEndRef = useRef(null);
  const bottomRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Fetch conversations, courses, and enrolled students
  useEffect(() => {
    fetchConversations();
    fetchCourses();
    fetchEnrolledStudents();
    const urlParams = new URLSearchParams(location.search);
    const convId = urlParams.get('conversation');
    if (convId) {
      fetchConversationDetail(convId);
      startPolling(convId);
    }
    return () => stopPolling();
  }, []);

  // Re-fetch enrolled students when modal opens
  useEffect(() => {
    if (showStudentList) {
      fetchEnrolledStudents();
    }
  }, [showStudentList]);

  // Fetch conversation detail when URL changes
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const convId = urlParams.get('conversation');
    if (convId) {
      fetchConversationDetail(convId);
      startPolling(convId);
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [location.search]);

  const fetchConversations = async () => {
    try {
      const response = await messageApi.getConversations();
      setConversations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await teacherApi.getCourses();
      setCourses(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchEnrolledStudents = async () => {
    try {
      const response = await messageApi.getEnrolledStudents();
      console.log('Enrolled students response:', response.data);
      setEnrolledStudents(response.data || []);
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      console.error('Error details:', error.response?.data);
      setEnrolledStudents([]);
    }
  };

  const fetchConversationDetail = async (id) => {
    try {
      const response = await messageApi.getConversation(id);
      const conversation = response.data.conversation;
      setSelectedConversation(conversation);
      
      // Sort messages by created_at ascending (oldest first, newest at bottom)
      const sortedMessages = [...response.data.messages].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
      setMessages(sortedMessages);
      
      // Mark messages as read when conversation is opened
      try {
        await messageApi.markMessagesRead(id);
        // Update local conversation state to reflect unread_count = 0
        setSelectedConversation({
          ...conversation,
          unread_count: 0
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
      
      // Refresh conversations to update unread count
      await fetchConversations();
      
      // Auto-scroll to bottom after a short delay to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể tải cuộc trò chuyện',
      });
    }
  };

  const startPolling = (id) => {
    pollingIntervalRef.current = setInterval(() => {
      fetchConversationDetail(id);
    }, 5000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    // For announcement conversations, only teacher can send
    if (selectedConversation.is_group) {
      // This is already handled by backend, but we can add UI feedback
    }

    setSending(true);
    try {
      await messageApi.sendMessage(selectedConversation.id, newMessage);
      setNewMessage('');
      await fetchConversationDetail(selectedConversation.id);
      await fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể gửi tin nhắn',
      });
    } finally {
      setSending(false);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastCourseId || !broadcastContent.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng chọn khóa học và nhập nội dung thông báo',
      });
      return;
    }

    try {
      await messageApi.broadcastMessage(broadcastCourseId, broadcastContent);
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Thông báo đã được gửi đến tất cả học viên',
        timer: 2000,
        showConfirmButton: false,
      });
      setShowBroadcastModal(false);
      setBroadcastCourseId('');
      setBroadcastContent('');
      await fetchConversations();
    } catch (error) {
      console.error('Error broadcasting message:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: error.response?.data?.error || 'Không thể gửi thông báo',
      });
    }
  };

  const handleStartPrivateChat = async (studentId) => {
    try {
      console.log('Starting private chat with student:', studentId);
      const response = await messageApi.startPrivateChat(studentId, null);
      console.log('Start private chat response:', response.data);
      
      const conversationId = response.data.id || response.data.conversation_id;
      if (!conversationId) {
        throw new Error('No conversation ID returned from server');
      }
      
      navigate(`/teacher/messages?conversation=${conversationId}`);
      setSelectedConversation(response.data);
      await fetchConversationDetail(conversationId);
      startPolling(conversationId);
      setShowStudentList(false);
      // Refresh conversations list
      await fetchConversations();
      
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: response.data.created ? 'Cuộc trò chuyện mới đã được tạo' : 'Đã mở cuộc trò chuyện',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error starting private chat:', error);
      console.error('Error response:', error.response);
      console.error('Error details:', error.response?.data);
      
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.details 
        || error.response?.data?.detail 
        || error.message 
        || 'Không thể bắt đầu cuộc trò chuyện';
      
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: errorMessage,
      });
    }
  };

  const handleConversationClick = async (conversation) => {
    navigate(`/teacher/messages?conversation=${conversation.id}`);
    setSelectedConversation(conversation);
    await fetchConversationDetail(conversation.id);
    startPolling(conversation.id);
  };

  const getConversationName = (conversation) => {
    // Use conversation_title from backend if available
    if (conversation.conversation_title) {
      return conversation.conversation_title;
    }
    // Fallback logic
    if (conversation.is_group && conversation.course_title) {
      return `📢 Thông báo khóa học: ${conversation.course_title}`;
    }
    const participants = conversation.participants_info || [];
    const otherParticipant = participants.find(
      (p) => p.id !== user?.id && (p.type === 'student')
    );
    return otherParticipant ? otherParticipant.name : 'Cuộc trò chuyện';
  };

  const getConversationAvatar = (conversation) => {
    if (conversation.is_group) {
      return <FiUsers className="text-xl" />;
    }
    return <FiUser className="text-xl" />;
  };

  const isMyMessage = (message) => {
    return message.sender_type === 'teacher' && message.sender_id === user?.id;
  };

  const filteredConversations = conversations.filter((conv) =>
    getConversationName(conv).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-indigo-50/30 dark:bg-gray-900 pt-8 pb-8">
      <div className="container mx-auto px-6 h-full">
        <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tin nhắn</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowStudentList(true)}
                    className="p-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                    title="Nhắn tin với học viên"
                  >
                    <FiUser />
                  </button>
                  <button
                    onClick={() => setShowBroadcastModal(true)}
                    className="p-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                    title="Gửi thông báo"
                  >
                    <FiMessageCircle />
                  </button>
                </div>
              </div>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Đang tải...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchQuery ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có cuộc trò chuyện nào'}
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => handleConversationClick(conversation)}
                    className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-colors ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/20'
                        : conversation.unread_count > 0
                        ? 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white">
                        {getConversationAvatar(conversation)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 
                            className={`truncate ${
                              conversation.unread_count > 0
                                ? 'font-bold text-gray-900 dark:text-white'
                                : 'font-semibold text-gray-900 dark:text-white'
                            }`}
                          >
                            {getConversationName(conversation)}
                          </h3>
                          {conversation.unread_count > 0 && (
                            <span className="bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                        {conversation.last_message && (
                          <p 
                            className={`text-sm truncate ${
                              conversation.unread_count > 0
                                ? 'font-semibold text-gray-900 dark:text-white'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {conversation.last_message.content}
                          </p>
                        )}
                        {conversation.last_message && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {new Date(conversation.last_message.created_at).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white">
                      {getConversationAvatar(selectedConversation)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {getConversationName(selectedConversation)}
                      </h3>
                      {selectedConversation.is_group && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tin nhắn nhóm</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isMyMessage(message)
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        {!isMyMessage(message) && (
                          <div className="text-xs font-semibold mb-1 opacity-75">
                            {message.sender_name}
                          </div>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isMyMessage(message) ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {new Date(message.created_at).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      placeholder={selectedConversation.is_group ? "Nhập thông báo..." : "Nhập tin nhắn..."}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={sending}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <FiSend />
                      Gửi
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FiUser className="text-6xl text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Chọn một cuộc trò chuyện để bắt đầu
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Broadcast Modal */}
      <AnimatePresence>
        {showBroadcastModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowBroadcastModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Gửi thông báo
                </h3>
                <button
                  onClick={() => setShowBroadcastModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chọn khóa học
                  </label>
                  <select
                    value={broadcastCourseId}
                    onChange={(e) => setBroadcastCourseId(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Chọn khóa học --</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nội dung thông báo
                  </label>
                  <textarea
                    value={broadcastContent}
                    onChange={(e) => setBroadcastContent(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Nhập nội dung thông báo..."
                  />
                </div>
                <button
                  onClick={handleBroadcast}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Gửi thông báo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student List Modal */}
      <AnimatePresence>
        {showStudentList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowStudentList(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Chọn học viên
                </h3>
                <button
                  onClick={() => setShowStudentList(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {enrolledStudents.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Chưa có học viên nào đăng ký</p>
                ) : (
                  <div className="space-y-2">
                    {enrolledStudents.map((student) => (
                      <button
                        key={student.id}
                        onClick={() => handleStartPrivateChat(student.id)}
                        className="w-full p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {student.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{student.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherMessages;
