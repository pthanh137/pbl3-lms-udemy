import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiBook,
  FiTrash2,
  FiArrowRight,
  FiVideo,
  FiClock,
  FiHash,
  FiYoutube,
  FiLink,
  FiLayers,
} from 'react-icons/fi';
import { teacherApi } from '../../api/teacherApi';
import Swal from 'sweetalert2';
import ReactPlayer from 'react-player';

const AllLessons = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllLessons();
  }, []);

  const fetchAllLessons = async () => {
    try {
      setLoading(true);
      // Get all lessons without section filter
      const response = await teacherApi.getAllLessons();
      const lessonsData = response.data.results || response.data || [];
      setLessons(lessonsData);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      Swal.fire('Error', 'Failed to load lessons', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lessonId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await teacherApi.deleteLesson(lessonId);
        Swal.fire('Deleted!', 'Lesson has been deleted.', 'success');
        fetchAllLessons();
      } catch (error) {
        console.error('Error deleting lesson:', error);
        Swal.fire('Error', 'Failed to delete lesson', 'error');
      }
    }
  };

  const getVideoType = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    if (url.endsWith('.mp4') || url.includes('.mp4')) return 'mp4';
    return 'other';
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading lessons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                All Lessons
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage all your lessons across all courses
              </p>
            </div>
          </div>
        </motion.div>

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
                No lessons found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                You haven't created any lessons yet. Create lessons from course sections.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/teacher/courses')}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <FiArrowRight className="text-xl" />
                Go to Manage Courses
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons
              .sort((a, b) => {
                // Sort by course title, then section order, then lesson order
                const courseA = a.section?.course?.title || '';
                const courseB = b.section?.course?.title || '';
                if (courseA !== courseB) return courseA.localeCompare(courseB);
                
                const sectionA = a.section?.order || 0;
                const sectionB = b.section?.order || 0;
                if (sectionA !== sectionB) return sectionA - sectionB;
                
                return (a.order || 0) - (b.order || 0);
              })
              .map((lesson, index) => {
                const videoType = getVideoType(lesson.video_url);
                return (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-200"
                  >
                    {/* Lesson Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FiBook className="text-white text-xl" />
                          <span className="text-white font-semibold text-sm">
                            Lesson #{lesson.order || index + 1}
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
                      {lesson.section?.course && (
                        <div className="flex items-center gap-2 text-white/90 text-xs">
                          <FiLayers className="text-xs" />
                          <span>{lesson.section.course.title} - Section {lesson.section.order}</span>
                        </div>
                      )}
                    </div>

                    {/* Video Preview */}
                    {lesson.video_url && (
                      <div className="relative w-full h-48 bg-gray-900">
                        {videoType === 'youtube' || videoType === 'vimeo' ? (
                          <ReactPlayer
                            url={lesson.video_url}
                            width="100%"
                            height="100%"
                            controls={false}
                            light={true}
                            playing={false}
                          />
                        ) : videoType === 'mp4' ? (
                          <video
                            src={lesson.video_url}
                            className="w-full h-full object-cover"
                            controls={false}
                            muted
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800">
                            <FiVideo className="text-4xl text-gray-500" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Lesson Content */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {lesson.title}
                      </h3>
                      
                      {lesson.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {lesson.description}
                        </p>
                      )}

                      {/* Lesson Info */}
                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
                        {lesson.duration_seconds && (
                          <div className="flex items-center gap-1">
                            <FiClock className="text-xs" />
                            <span>{formatDuration(lesson.duration_seconds)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <FiHash className="text-xs" />
                          <span>Order: {lesson.order || 0}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => {
                            if (lesson.section?.course?.id) {
                              navigate(`/teacher/courses/${lesson.section.course.id}/sections`);
                            } else {
                              navigate('/teacher/courses');
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                        >
                          <FiLayers size={14} />
                          View Section
                        </button>
                        <button
                          onClick={() => handleDelete(lesson.id)}
                          className="flex items-center justify-center gap-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                        >
                          <FiTrash2 size={14} />
                        </button>
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

export default AllLessons;


