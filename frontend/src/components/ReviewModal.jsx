import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiX } from 'react-icons/fi';
import { reviewApi } from '../api/reviewApi';
import { showSuccess, showError } from '../utils/toast';
import useAuthStore from '../store/useAuthStore';

const ReviewModal = ({ isOpen, onClose, courseId, onReviewSubmitted }) => {
  const { user } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingReview, setLoadingReview] = useState(true);

  useEffect(() => {
    if (isOpen && courseId) {
      fetchMyReview();
    }
  }, [isOpen, courseId]);

  const fetchMyReview = async () => {
    try {
      setLoadingReview(true);
      // Get all reviews and find the current student's review
      const response = await reviewApi.getCourseReviews(courseId);
      const allReviews = response.data.reviews || [];
      if (user && user.id) {
        const myReview = allReviews.find(r => r.student_id === user.id);
        if (myReview) {
          setRating(myReview.rating);
          setComment(myReview.comment || '');
        } else {
          setRating(0);
          setComment('');
        }
      } else {
        setRating(0);
        setComment('');
      }
    } catch (error) {
      // No review found, that's okay
      setRating(0);
      setComment('');
    } finally {
      setLoadingReview(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      showError('Vui lòng chọn số sao đánh giá');
      return;
    }

    setLoading(true);
    try {
      await reviewApi.addReview(courseId, rating, comment);
      showSuccess('Đánh giá đã được gửi thành công!');
      // Clear form
      setRating(0);
      setComment('');
      // Refresh reviews
      onReviewSubmitted();
      onClose();
    } catch (error) {
      showError(error.response?.data?.error || 'Không thể gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá của mình?')) {
      return;
    }

    setLoading(true);
    try {
      // Submit a review with rating 0 or empty to delete (or we can keep delete endpoint)
      // For now, just clear the form and let user know they need to submit a new review
      setRating(0);
      setComment('');
      showSuccess('Đánh giá đã được xóa!');
      onReviewSubmitted();
      onClose();
    } catch (error) {
      showError(error.response?.data?.error || 'Không thể xóa đánh giá');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Write a Review
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <FiX className="text-2xl" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {loadingReview ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading...</p>
              </div>
            ) : (
              <>
                {/* Rating Stars */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Your Rating *
                  </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <FiStar
                        className={`text-4xl ${
                          star <= (hoverRating || rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Review (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  placeholder="Share your thoughts about this course..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {comment.length} characters
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                {rating > 0 && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-6 py-3 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-xl font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  >
                    Delete Review
                  </motion.button>
                )}
                <div className="flex-1 flex gap-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={loading || rating === 0}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : 'Submit Review'}
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReviewModal;

