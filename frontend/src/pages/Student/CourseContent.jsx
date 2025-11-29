import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlay, FiCheck, FiList, FiAward, FiVideo, FiExternalLink } from 'react-icons/fi';
import { studentApi } from '../../api/studentApi';
import { certificateApi } from '../../api/certificateApi';
import SkeletonBlock from '../../components/SkeletonBlock';
import VideoPlayer from '../../components/VideoPlayer';
import useVideoProgress from '../../hooks/useVideoProgress';

const CourseContent = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [progressData, setProgressData] = useState({});
  const [certificateId, setCertificateId] = useState(null);
  
  // Use video progress hook
  const {
    watchedSeconds,
    progressPercent,
    isCompleted,
    updateProgress: updateProgressHook,
    handleVideoEnd: handleVideoEndHook,
    setWatchedSeconds,
  } = useVideoProgress(selectedLesson?.id, selectedLesson?.duration_seconds);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await studentApi.getCourseContent(courseId);
        setCourse(response.data);
        
        // Build progress map
        const progressMap = {};
        response.data.sections?.forEach(section => {
          section.lessons?.forEach(lesson => {
            if (lesson.progress) {
              progressMap[lesson.id] = lesson.progress;
            }
          });
        });
        setProgressData(progressMap);
        
        // Select first lesson if available
        if (response.data.sections?.[0]?.lessons?.[0]) {
          setSelectedLesson(response.data.sections[0].lessons[0]);
          const firstLesson = response.data.sections[0].lessons[0];
          if (firstLesson.progress) {
            setWatchedSeconds(firstLesson.progress.watched_seconds || 0);
          }
        }
        
        // Check for certificate if course is completed
        if (response.data.enrollment_completed) {
          try {
            const certResponse = await certificateApi.getMyCertificates();
            const certificate = certResponse.data.results?.find(
              cert => cert.course === parseInt(courseId)
            );
            if (certificate) {
              setCertificateId(certificate.id);
            }
          } catch (error) {
            console.error('Error fetching certificate:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  // Calculate course completion percentage
  const calculateCompletion = () => {
    if (!course) return 0;
    
    let totalLessons = 0;
    let completedLessons = 0;
    
    course.sections?.forEach(section => {
      section.lessons?.forEach(lesson => {
        totalLessons++;
        const progress = progressData[lesson.id];
        if (progress && progress.completed) {
          completedLessons++;
        }
      });
    });
    
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  // Handle video error - stable callback
  const handleVideoError = useCallback((error) => {
    console.error('Video error:', error);
  }, []);

  // Handle progress update from VideoPlayer - use useCallback to prevent re-renders
  const handleProgress = useCallback(async (progressData) => {
    if (!selectedLesson) return;
    
    const { currentTime, duration, progressPercent, completed } = progressData;
    
    // Update local progress data (this is fine, it's throttled in useVideoProgress)
    setProgressData(prev => ({
      ...prev,
      [selectedLesson.id]: {
        watched_seconds: currentTime,
        completed: completed
      }
    }));
    
    // Update via hook (which handles debouncing)
    await updateProgressHook(currentTime, duration, completed);
    
    // Refresh course data if completed
    if (completed) {
      try {
        const response = await studentApi.getCourseContent(courseId);
        setCourse(response.data);
        
        // Check for certificate
        if (response.data.enrollment_completed) {
          try {
            const certResponse = await certificateApi.getMyCertificates();
            const certificate = certResponse.data.results?.find(
              cert => cert.course === parseInt(courseId)
            );
            if (certificate) {
              setCertificateId(certificate.id);
            }
          } catch (error) {
            console.error('Error fetching certificate:', error);
          }
        }
      } catch (error) {
        console.error('Error refreshing course data:', error);
      }
    }
  }, [selectedLesson, courseId, updateProgressHook]);
  
  // Handle video end - use useCallback to prevent re-renders
  const handleVideoEnd = useCallback(async () => {
    if (!selectedLesson) return;
    
    await handleVideoEndHook();
    
    // Refresh course data
    try {
      const response = await studentApi.getCourseContent(courseId);
      setCourse(response.data);
      
      // Check for certificate
      if (response.data.enrollment_completed) {
        try {
          const certResponse = await certificateApi.getMyCertificates();
          const certificate = certResponse.data.results?.find(
            cert => cert.course === parseInt(courseId)
          );
          if (certificate) {
            setCertificateId(certificate.id);
          }
        } catch (error) {
          console.error('Error fetching certificate:', error);
        }
      }
    } catch (error) {
      console.error('Error refreshing course data:', error);
    }
  }, [selectedLesson, courseId, handleVideoEndHook]);

  // Reset watched seconds when lesson changes
  useEffect(() => {
    if (selectedLesson) {
      const progress = progressData[selectedLesson.id];
      setWatchedSeconds(progress?.watched_seconds || 0);
    }
  }, [selectedLesson, progressData, setWatchedSeconds]);

  // Handle lesson selection
  const handleLessonSelect = (lesson) => {
    setSelectedLesson(lesson);
    const progress = progressData[lesson.id];
    setWatchedSeconds(progress?.watched_seconds || 0);
  };

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get progress percentage for a lesson
  const getLessonProgress = (lesson) => {
    const progress = progressData[lesson.id];
    if (!progress || !lesson.duration_seconds) return 0;
    return Math.min(100, Math.round((progress.watched_seconds / lesson.duration_seconds) * 100));
  };

  if (loading) {
    return <SkeletonBlock />;
  }

  if (!course) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Course not found</p>
      </div>
    );
  }

  const completionPercentage = calculateCompletion();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
      <div className="container mx-auto px-6">
        {/* Course Header with Completion */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">{course.title}</h1>
              <p className="text-gray-600 dark:text-gray-400">{course.description}</p>
            </div>
            <div className="text-right">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 min-w-[200px]">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Course Progress</p>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <span className="text-lg font-bold text-gray-800 dark:text-white">{completionPercentage}%</span>
                </div>
                {course.enrollment_completed && (
                  <div className="flex flex-col gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <FiCheck className="mr-1" />
                      Course Completed
                    </span>
                    {certificateId && (
                      <button
                        onClick={() => navigate(`/student/certificates/${certificateId}`)}
                        className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
                      >
                        <FiAward className="mr-2" />
                        View Certificate
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Sections & Lessons */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="flex items-center space-x-2 mb-4">
                <FiList className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Course Content</h3>
              </div>
              <div className="space-y-4">
                {course.sections?.map((section) => (
                  <div key={section.id} className="mb-4">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-sm">
                      {section.title}
                    </h4>
                    <ul className="space-y-1">
                      {section.lessons?.map((lesson) => {
                        const progress = progressData[lesson.id];
                        const lessonProgress = getLessonProgress(lesson);
                        const isCompleted = progress?.completed || false;
                        
                        return (
                          <li key={lesson.id}>
                            <button
                              onClick={() => handleLessonSelect(lesson)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                selectedLesson?.id === lesson.id
                                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium'
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              <div className="flex items-center space-x-2 mb-1">
                                {isCompleted ? (
                                  <FiCheck className="text-green-600 dark:text-green-400 text-xs flex-shrink-0" />
                                ) : (
                                  <FiPlay className="text-xs flex-shrink-0" />
                                )}
                                <span className="flex-1 truncate">{lesson.title}</span>
                              </div>
                              {lesson.duration_seconds && (
                                <div className="mt-1">
                                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    <span>{formatTime(progress?.watched_seconds || 0)} / {formatTime(lesson.duration_seconds)}</span>
                                    <span>{lessonProgress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                    <div
                                      className={`h-1.5 rounded-full transition-all duration-300 ${
                                        isCompleted
                                          ? 'bg-green-500'
                                          : 'bg-indigo-500'
                                      }`}
                                      style={{ width: `${lessonProgress}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {selectedLesson ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {selectedLesson.title}
                  </h2>
                  {progressData[selectedLesson.id]?.completed && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <FiCheck className="mr-1" />
                      Completed
                    </span>
                  )}
                </div>
                {selectedLesson.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedLesson.description}</p>
                )}
                
                {/* Video URL Link - Always visible */}
                {selectedLesson.video_url && (
                  <div className="mb-4 flex items-center gap-2">
                    <FiVideo className="text-indigo-600 dark:text-indigo-400" />
                    <a
                      href={selectedLesson.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-2"
                    >
                      <span>Mở video trong tab mới</span>
                      <FiExternalLink className="text-sm" />
                    </a>
                  </div>
                )}

                {selectedLesson.video_url ? (
                  <div className="mb-6">
                    <VideoPlayer
                      key={`video-${selectedLesson.id}`}
                      videoUrl={selectedLesson.video_url}
                      durationSeconds={selectedLesson.duration_seconds}
                      initialProgress={progressData[selectedLesson.id]?.watched_seconds || 0}
                      onProgress={handleProgress}
                      onEnded={handleVideoEnd}
                      onError={handleVideoError}
                      className="mb-4"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-6">
                    <p className="text-gray-500 dark:text-gray-400">Không có video</p>
                  </div>
                )}
                {selectedLesson.duration_seconds && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>Progress: {formatTime(watchedSeconds)} / {formatTime(selectedLesson.duration_seconds)}</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, progressPercent)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
                <FiPlay className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Select a lesson to start learning</p>
              </div>
            )}
          </div>

          {/* Quizzes Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Quizzes</h3>
              {course.quizzes?.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No quizzes available</p>
              ) : (
                <div className="space-y-3">
                  {course.quizzes?.map((quiz) => (
                    <a
                      key={quiz.id}
                      href={`/student/quiz/${quiz.id}`}
                      className="block p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors border border-indigo-200 dark:border-indigo-800"
                    >
                      <h4 className="font-semibold text-gray-800 dark:text-white text-sm mb-1">
                        {quiz.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Pass: {quiz.pass_mark}%</p>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseContent;
