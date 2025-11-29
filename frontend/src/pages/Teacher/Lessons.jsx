import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiBook,
  FiPlus,
  FiTrash2,
  FiArrowLeft,
  FiVideo,
  FiClock,
  FiHash,
  FiYoutube,
  FiLink,
  FiEdit,
} from 'react-icons/fi';
import { teacherApi } from '../../api/teacherApi';
import Swal from 'sweetalert2';
import ReactPlayer from 'react-player';
import { isYouTubeUrl, isMp4Url } from '../../utils/videoUtils';

const Lessons = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    video_url: '', 
    video_file: null,
    duration_seconds: '', 
    order: 0 
  });
  const [videoInputType, setVideoInputType] = useState('url'); // 'url' or 'file'
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState(null);

  useEffect(() => {
    if (sectionId) {
      // Reset state when section ID changes
      setLessons([]);
      setLoading(true);
      setSection(null);
      setShowForm(false);
      setEditingLessonId(null);
      setFormData({ title: '', description: '', video_url: '', video_file: null, duration_seconds: '', order: 0 });
      setVideoInputType('url');
      setVideoPreviewUrl(null);
      fetchLessons();
      fetchSection();
    } else {
      setLoading(false);
    }
  }, [sectionId]);

  const fetchSection = async () => {
    try {
      const response = await teacherApi.getSection(sectionId);
      setSection(response.data);
    } catch (error) {
      console.error('Error fetching section:', error);
    }
  };

  const fetchLessons = async () => {
    try {
      // Ensure sectionId is a number
      const sectionIdNum = parseInt(sectionId);
      if (isNaN(sectionIdNum)) {
        console.error('Invalid section ID:', sectionId);
        setLoading(false);
        return;
      }
      const response = await teacherApi.getLessons(sectionIdNum);
      setLessons(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('section', parseInt(sectionId));
      formDataToSend.append('duration_seconds', formData.duration_seconds ? parseInt(formData.duration_seconds) : '');
      formDataToSend.append('order', formData.order || 0);
      
      // Handle video: either file upload or URL
      if (videoInputType === 'file' && formData.video_file) {
        formDataToSend.append('video_file', formData.video_file);
        // Clear video_url when uploading file
        formDataToSend.append('video_url', '');
      } else if (videoInputType === 'url' && formData.video_url) {
        formDataToSend.append('video_url', formData.video_url);
      }
      
      if (editingLessonId) {
        // Update existing lesson
        await teacherApi.updateLesson(editingLessonId, formDataToSend);
        Swal.fire('Thành công', 'Đã cập nhật bài học thành công!', 'success');
      } else {
        // Create new lesson
        await teacherApi.createLesson(formDataToSend);
        Swal.fire('Thành công', 'Đã tạo bài học thành công!', 'success');
      }
      
      setShowForm(false);
      setEditingLessonId(null);
      setFormData({ title: '', description: '', video_url: '', video_file: null, duration_seconds: '', order: 0 });
      setVideoInputType('url');
      setVideoPreviewUrl(null);
      fetchLessons();
    } catch (error) {
      Swal.fire('Lỗi', error.response?.data?.error || (editingLessonId ? 'Không thể cập nhật bài học' : 'Không thể tạo bài học'), 'error');
    }
  };

  const handleEdit = async (lessonId) => {
    try {
      const response = await teacherApi.getLesson(lessonId);
      const lesson = response.data;
      setFormData({
        title: lesson.title || '',
        description: lesson.description || '',
        video_url: lesson.video_url || '',
        video_file: null,
        duration_seconds: lesson.duration_seconds || '',
        order: lesson.order || 0
      });
      // Determine input type based on existing video_url
      if (lesson.video_url) {
        if (isMp4Url(lesson.video_url) && lesson.video_url.includes('/media/')) {
          setVideoInputType('file');
        } else {
          setVideoInputType('url');
        }
      } else {
        setVideoInputType('url');
      }
      setVideoPreviewUrl(lesson.video_url || null);
      setEditingLessonId(lessonId);
      setShowForm(true);
      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      Swal.fire('Lỗi', 'Không thể tải thông tin bài học', 'error');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingLessonId(null);
    setFormData({ title: '', description: '', video_url: '', duration_seconds: '', order: 0 });
  };

  const handleDelete = async (lessonId) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: 'Hành động này sẽ xóa bài học vĩnh viễn!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Có, xóa nó!',
      cancelButtonText: 'Hủy',
    });

    if (result.isConfirmed) {
      try {
        await teacherApi.deleteLesson(lessonId);
        Swal.fire('Đã xóa!', 'Bài học đã được xóa.', 'success');
        fetchLessons();
      } catch (error) {
        Swal.fire('Lỗi', 'Không thể xóa bài học', 'error');
      }
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVideoType = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    if (url.includes('.mp4') || url.endsWith('.mp4')) return 'mp4';
    return 'other';
  };

  const isValidVideoUrl = (url) => {
    if (!url) return false;
    return (
      url.includes('youtube.com') ||
      url.includes('youtu.be') ||
      url.includes('vimeo.com') ||
      url.includes('.mp4') ||
      url.endsWith('.mp4')
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải bài học...</p>
        </div>
      </div>
    );
  }

  // Show error if no sectionId
  if (!sectionId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Cần ID phần học
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Vui lòng điều hướng đến bài học từ trang phần học.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/teacher/courses')}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 mx-auto"
            >
              <FiArrowLeft className="text-xl" />
              Quay lại khóa học
            </motion.button>
          </div>
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
            onClick={() => {
              // Navigate back to sections page - need to get courseId from section
              if (section?.course) {
                navigate(`/teacher/courses/${section.course}/sections`);
              } else {
                navigate('/teacher/courses');
              }
            }}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-colors"
          >
            <FiArrowLeft className="text-lg" />
            <span>Quay lại phần học</span>
          </motion.button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Quản lý bài học
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {section?.title ? (
                  <>
                    Phần học: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{section.title}</span>
                  </>
                ) : (
                  'Tạo và quản lý bài học cho phần học này'
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
                  setEditingLessonId(null);
                  setFormData({ title: '', description: '', video_url: '', video_file: null, duration_seconds: '', order: 0 });
      setVideoInputType('url');
      setVideoPreviewUrl(null);
                }
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 ${
                showForm
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl'
              }`}
            >
              <FiPlus className="text-xl" />
              {showForm ? 'Hủy' : 'Thêm bài học mới'}
            </motion.button>
          </div>
        </div>

        {/* Add Lesson Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiBook className="text-indigo-600" />
              {editingLessonId ? 'Chỉnh sửa bài học' : 'Tạo bài học mới'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên bài học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="Ví dụ: Giới thiệu Python, Biến và Kiểu dữ liệu, v.v."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  rows="3"
                  placeholder="Mô tả ngắn gọn về bài học..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Video
                </label>
                
                {/* Toggle between URL and File Upload */}
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="videoInputType"
                      value="url"
                      checked={videoInputType === 'url'}
                      onChange={(e) => {
                        setVideoInputType('url');
                        setFormData({ ...formData, video_file: null });
                        setVideoPreviewUrl(null);
                      }}
                      className="text-indigo-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">YouTube URL</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="videoInputType"
                      value="file"
                      checked={videoInputType === 'file'}
                      onChange={(e) => {
                        setVideoInputType('file');
                        setFormData({ ...formData, video_url: '' });
                        setVideoPreviewUrl(null);
                      }}
                      className="text-indigo-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Tải lên MP4</span>
                  </label>
                </div>

                {/* URL Input */}
                {videoInputType === 'url' && (
                  <>
                    <input
                      type="url"
                      value={formData.video_url}
                      onChange={(e) => {
                        setFormData({ ...formData, video_url: e.target.value });
                        setVideoPreviewUrl(e.target.value);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                      placeholder="https://youtube.com/watch?v=... hoặc https://youtu.be/..."
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Dán link YouTube (youtube.com hoặc youtu.be)
                    </p>
                  </>
                )}

                {/* File Upload Input */}
                {videoInputType === 'file' && (
                  <>
                    <input
                      type="file"
                      accept="video/mp4"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 500 * 1024 * 1024) { // 500MB limit
                            Swal.fire('Lỗi', 'File video không được vượt quá 500MB', 'error');
                            return;
                          }
                          setFormData({ ...formData, video_file: file });
                          setVideoPreviewUrl(URL.createObjectURL(file));
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Chọn file MP4 (tối đa 500MB)
                    </p>
                    {formData.video_file && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Đã chọn: {formData.video_file.name} ({(formData.video_file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </>
                )}
              </div>
              {(formData.video_url || formData.video_file) && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Xem trước video
                    </label>
                    <a
                      href={formData.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <FiLink />
                      Mở trong tab mới
                    </a>
                  </div>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-700">
                    {videoInputType === 'file' && videoPreviewUrl ? (
                      <div className="w-full rounded-lg overflow-hidden bg-black">
                        <video
                          src={videoPreviewUrl}
                          controls
                          className="w-full"
                          style={{ maxHeight: '300px' }}
                        />
                      </div>
                    ) : formData.video_url && isValidVideoUrl(formData.video_url) ? (
                      <div className="w-full rounded-lg overflow-hidden bg-black relative">
                        <ReactPlayer
                          url={formData.video_url}
                          width="100%"
                          height="300px"
                          controls={true}
                          playing={false}
                          light={false}
                          pip={false}
                          stopOnUnmount={false}
                          config={{
                            youtube: {
                              playerVars: {
                                autoplay: 0,
                                controls: 1,
                                rel: 0,
                                modestbranding: 1,
                              },
                            },
                            vimeo: {
                              playerOptions: {
                                controls: true,
                                responsive: true,
                              },
                            },
                          }}
                        />
                        <div className="absolute bottom-2 right-2">
                          <a
                            href={formData.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 bg-black/70 text-white rounded text-xs hover:bg-black/90 transition-colors flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FiLink />
                            Mở tab mới
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <FiVideo className="text-4xl mx-auto mb-2" />
                        <p>
                          {videoInputType === 'file' 
                            ? 'Chọn file MP4 để xem trước' 
                            : 'Nhập URL YouTube hợp lệ để xem trước'}
                        </p>
                        {formData.video_url && (
                          <a
                            href={formData.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            Mở URL trong tab mới
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Thời lượng (giây) <span className="text-gray-500 text-xs">(Tùy chọn)</span>
                </label>
                <input
                  type="number"
                  value={formData.duration_seconds}
                  onChange={(e) => setFormData({ ...formData, duration_seconds: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="Ví dụ: 600 cho 10 phút"
                  min="0"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Thời lượng video tính bằng giây (để theo dõi tiến độ)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Thứ tự <span className="text-gray-500 text-xs">(Thứ tự hiển thị trong phần học)</span>
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="flex gap-3">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {editingLessonId ? 'Cập nhật bài học' : 'Tạo bài học'}
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

        {/* Lessons List */}
        {lessons.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center"
          >
            <div className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                <FiBook className="text-4xl text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Chưa có bài học nào
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                Tạo bài học đầu tiên để thêm nội dung vào phần học này.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <FiPlus className="text-xl" />
                Tạo bài học đầu tiên
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons
              .sort((a, b) => a.order - b.order)
              .map((lesson, index) => {
                const videoType = getVideoType(lesson.video_url);
                return (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-200"
                  >
                    {/* Lesson Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FiBook className="text-white text-xl" />
                          <span className="text-white font-semibold text-sm">
                            Bài học #{lesson.order || index + 1}
                          </span>
                        </div>
                        {videoType && (
                          <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                            {videoType === 'youtube' && <FiYoutube className="text-white text-xs" />}
                            {videoType === 'vimeo' && <FiVideo className="text-white text-xs" />}
                            {videoType === 'mp4' && <FiLink className="text-white text-xs" />}
                            <span className="text-white text-xs font-semibold capitalize">{videoType}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Lesson Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {lesson.title}
                      </h3>
                      {lesson.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                          {lesson.description}
                        </p>
                      )}

                      <div className="space-y-2 mb-4">
                        {lesson.duration_seconds && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <FiClock className="text-base" />
                            <span>Thời lượng: {formatDuration(lesson.duration_seconds)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FiHash className="text-base" />
                          <span>Thứ tự: {lesson.order || 0}</span>
                        </div>
                        {lesson.video_url && (
                          <div className="flex items-center gap-2 text-sm">
                            <FiVideo className="text-base text-indigo-600" />
                            <a
                              href={lesson.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 dark:text-indigo-400 hover:underline truncate"
                            >
                              Xem video
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Video Preview */}
                      {lesson.video_url && isValidVideoUrl(lesson.video_url) && (
                        <div className="mb-4 rounded-lg overflow-hidden bg-black relative">
                          <ReactPlayer
                            url={lesson.video_url}
                            width="100%"
                            height="180px"
                            controls={true}
                            playing={false}
                            light={false}
                            pip={false}
                            stopOnUnmount={false}
                            config={{
                              youtube: {
                                playerVars: {
                                  autoplay: 0,
                                  controls: 1,
                                  rel: 0,
                                  modestbranding: 1,
                                },
                              },
                              vimeo: {
                                playerOptions: {
                                  controls: true,
                                  responsive: true,
                                },
                              },
                            }}
                          />
                          <div className="absolute bottom-2 right-2">
                            <a
                              href={lesson.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 bg-black/70 text-white rounded text-xs hover:bg-black/90 transition-colors flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FiLink />
                              Mở tab mới
                            </a>
                          </div>
                        </div>
                      )}
                      {lesson.video_url && !lesson.video_url.includes('youtube') && !lesson.video_url.includes('vimeo') && !lesson.video_url.includes('.mp4') && (
                        <div className="mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 p-4 text-center">
                          <FiVideo className="text-2xl mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">Đã cung cấp URL video</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEdit(lesson.id)}
                          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white h-10 rounded-xl shadow-sm hover:shadow-md transition-all"
                        >
                          <FiEdit size={16} />
                          <span className="text-sm font-medium">Chỉnh sửa</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(lesson.id)}
                          className="flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 h-10 rounded-xl shadow-sm hover:shadow-md transition-all"
                        >
                          <FiTrash2 size={16} />
                          <span className="text-sm font-medium">Xóa</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lessons;
