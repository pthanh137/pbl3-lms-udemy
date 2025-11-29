import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBook, FiUsers, FiEye, FiPlay, FiCheck, FiShoppingCart, FiStar, FiEdit3 } from 'react-icons/fi';
import { publicApi } from '../../api/publicApi';
import { studentApi } from '../../api/studentApi';
import { paymentApi } from '../../api/paymentApi';
import { reviewApi } from '../../api/reviewApi';
import useAuthStore from '../../store/useAuthStore';
import { showSuccess, showError, showInfo } from '../../utils/toast';
import { formatPrice } from '../../utils/formatPrice';
import SkeletonBlock from '../../components/SkeletonBlock';
import ReviewModal from '../../components/ReviewModal';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [myReview, setMyReview] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await publicApi.getCourseContent(id);
        setCourse(response.data);
      } catch (error) {
        console.error('Error fetching course:', error);
        showError('Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
    fetchReviews();
    if (role === 'student') {
      fetchMyReview();
    }
  }, [id, role]);

  useEffect(() => {
    const checkEnrollment = async () => {
      if (role !== 'student') {
        setCheckingEnrollment(false);
        return;
      }
      try {
        const response = await studentApi.getMyCourses();
        const enrolledCourses = response.data.results || response.data || [];
        const courseId = parseInt(id);
        const enrolled = enrolledCourses.some((enrollment) => {
          // Handle different response formats
          if (enrollment.course) {
            return enrollment.course.id === courseId || enrollment.course === courseId;
          }
          return enrollment.course_id === courseId;
        });
        setIsEnrolled(enrolled);
      } catch (error) {
        console.error('Error checking enrollment:', error);
        setIsEnrolled(false);
      } finally {
        setCheckingEnrollment(false);
      }
    };
    checkEnrollment();
  }, [id, role]);

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const response = await reviewApi.getCourseReviews(id);
      setReviews(response.data.reviews || []);
      // Update course rating if available
      if (response.data.average_rating !== undefined) {
        setCourse(prev => prev ? {
          ...prev,
          average_rating: response.data.average_rating,
          total_reviews: response.data.total_reviews
        } : null);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchMyReview = async () => {
    try {
      const response = await reviewApi.getMyReview(id);
      setMyReview(response.data);
    } catch (error) {
      // No review found, that's okay
      setMyReview(null);
    }
  };

  const handleReviewSubmitted = () => {
    fetchReviews();
    fetchMyReview();
    // Refresh course to get updated rating
    publicApi.getCourseContent(id).then(response => {
      setCourse(response.data);
    });
  };

  const handleBuyNow = async () => {
    if (role !== 'student') {
      // Redirect to register with course ID
      navigate(`/student/register?course=${id}`);
      return;
    }

    setEnrolling(true);
    try {
      const response = await paymentApi.createOrder(id);
      window.location.href = response.data.payment_url;
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to create order');
      setEnrolling(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400 text-white py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
            <p className="text-xl text-gray-100 mb-6">{course.description}</p>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <FiBook className="text-lg" />
                <span>{course.level}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiEye className="text-lg" />
                <span>{course.views} lượt xem</span>
              </div>
              {course.average_rating > 0 && (
                <div className="flex items-center space-x-2">
                  <FiStar className="text-lg text-yellow-400 fill-yellow-400" />
                  <span>{course.average_rating.toFixed(1)} ({course.total_reviews || 0})</span>
                </div>
              )}
              {course.category && (
                <div className="flex items-center space-x-2">
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    {course.category.title}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {[
                  { key: 'overview', label: 'Tổng quan' },
                  { key: 'curriculum', label: 'Chương trình học' },
                  { key: 'quizzes', label: 'Bài kiểm tra' },
                  { key: 'reviews', label: 'Đánh giá' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                      activeTab === tab.key
                        ? 'text-blue-500 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                      Về khóa học này
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {course.description}
                    </p>
                    {course.teacher && (
                      <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                          Giảng viên
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">
                          {course.teacher.full_name}
                        </p>
                        {course.teacher.bio && (
                          <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {course.teacher.bio}
                          </p>
                        )}
                        {course.teacher.qualification && (
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                            {course.teacher.qualification}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'curriculum' && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                      Chương trình học
                    </h3>
                    {course.sections?.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400">
                        Chưa có phần học nào.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {course.sections?.map((section) => (
                          <div
                            key={section.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                          >
                            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                              <h4 className="font-semibold text-gray-800 dark:text-white">
                                {section.title}
                              </h4>
                            </div>
                            <div className="p-6">
                              {section.lessons?.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                  Chưa có bài học nào trong phần này.
                                </p>
                              ) : (
                                <ul className="space-y-3">
                                  {section.lessons?.map((lesson) => (
                                    <li
                                      key={lesson.id}
                                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                                        isEnrolled
                                          ? 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                                          : 'bg-gray-100 dark:bg-gray-800 opacity-75'
                                      }`}
                                    >
                                      <div className="flex items-center space-x-3 flex-1">
                                        <FiPlay className={`${isEnrolled ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
                                        <span className={`${isEnrolled ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                          {lesson.title}
                                        </span>
                                      </div>
                                      {lesson.video_url && (
                                        <>
                                          {isEnrolled ? (
                                            <Link
                                              to={`/student/course/${id}/content?lesson=${lesson.id}`}
                                              className="text-sm bg-blue-500 dark:bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors font-medium"
                                            >
                                              Xem
                                            </Link>
                                          ) : (
                                            <button
                                              onClick={() => {
                                                if (role === 'student') {
                                                  handleBuyNow();
                                                } else {
                                                  navigate(`/student/register?course=${id}`);
                                                }
                                              }}
                                              className="text-sm bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 px-4 py-2 rounded-lg cursor-pointer font-medium"
                                              title="Vui lòng đăng ký khóa học để xem bài học này"
                                            >
                                              Đăng ký để xem
                                            </button>
                                          )}
                                        </>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'quizzes' && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                      Course Quizzes
                    </h3>
                    {course.quizzes?.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400">
                        No quizzes available for this course.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {course.quizzes?.map((quiz) => (
                          <div
                            key={quiz.id}
                            className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                          >
                            <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                              {quiz.title}
                            </h4>
                            {quiz.description && (
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                                {quiz.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Pass Mark: {quiz.pass_mark}%
                              </span>
                              {role === 'student' && (
                                <Link
                                  to={`/student/quiz/${quiz.id}`}
                                  className="text-sm bg-blue-500 dark:bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                                >
                                  Take Quiz
                                </Link>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                          Đánh giá & Xếp hạng
                        </h3>
                        <div className="flex items-center gap-4">
                          {course.average_rating > 0 ? (
                            <>
                              <div className="flex items-center gap-2">
                                {renderStars(Math.round(course.average_rating))}
                                <span className="text-2xl font-bold text-gray-800 dark:text-white">
                                  {course.average_rating.toFixed(1)}
                                </span>
                              </div>
                              <span className="text-gray-600 dark:text-gray-400">
                                ({course.total_reviews || 0} {course.total_reviews === 1 ? 'đánh giá' : 'đánh giá'})
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-600 dark:text-gray-400">
                              Chưa có đánh giá
                            </span>
                          )}
                        </div>
                      </div>
                      {role === 'student' && isEnrolled && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowReviewModal(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                        >
                          <FiEdit3 />
                          {myReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
                        </motion.button>
                      )}
                    </div>

                    {loadingReviews ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Đang tải đánh giá...</p>
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <FiStar className="text-4xl text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                          Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá khóa học này!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                  {review.student_name?.charAt(0).toUpperCase() || 'S'}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800 dark:text-white">
                                    {review.student_name || 'Anonymous'}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    {renderStars(review.rating)}
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-gray-700 dark:text-gray-300 mt-3">
                                {review.comment}
                              </p>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 sticky top-24">
              <div className="mb-6">
                <div className="flex items-baseline space-x-2 mb-4">
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-400 bg-clip-text text-transparent">
                    {formatPrice(course.discount_price || course.price)}
                  </span>
                  {course.discount_price && (
                    <span className="text-lg text-gray-400 dark:text-gray-500 line-through">
                      {formatPrice(course.price)}
                    </span>
                  )}
                </div>
                {role === 'student' && !checkingEnrollment && (
                  <>
                    {isEnrolled ? (
                      <>
                        <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                            <FiCheck className="text-lg" />
                            <span className="font-semibold text-sm">Bạn đã mua khóa học này</span>
                          </div>
                        </div>
                        <Link
                          to={`/student/course/${id}/content`}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <FiPlay />
                          Bắt đầu học
                        </Link>
                      </>
                    ) : (
                      <button
                        onClick={handleBuyNow}
                        disabled={enrolling}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-400 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <FiShoppingCart />
                        {enrolling ? 'Đang xử lý...' : 'Mua ngay'}
                      </button>
                    )}
                  </>
                )}
                {!role && (
                  <Link
                    to={`/student/register?course=${id}`}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-400 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <FiShoppingCart />
                    Đăng ký & Mua khóa học
                  </Link>
                )}
                {role === 'student' && checkingEnrollment && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 py-3 rounded-lg font-semibold text-center">
                    Đang kiểm tra...
                  </div>
                )}
              </div>

              <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Cấp độ</span>
                  <span className="font-semibold text-gray-800 dark:text-white">{course.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Ngôn ngữ</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {course.language || 'Tiếng Việt'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Lượt xem</span>
                  <span className="font-semibold text-gray-800 dark:text-white">{course.views}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        courseId={id}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};

export default CourseDetail;
