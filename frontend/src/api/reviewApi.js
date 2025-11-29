import axiosClient from './axiosClient';

export const reviewApi = {
  // Add or update a review (NEW ENDPOINT)
  addReview: (courseId, rating, comment) => {
    return axiosClient.post(`courses/${courseId}/review/`, {
      rating: rating,
      comment: comment || '',
    });
  },

  // Get all reviews for a course (NEW ENDPOINT)
  getCourseReviews: (courseId) => {
    return axiosClient.get(`courses/${courseId}/reviews/`);
  },

  // Get rating summary (NEW ENDPOINT)
  getRatingSummary: (courseId) => {
    return axiosClient.get(`courses/${courseId}/rating_summary/`);
  },

  // Get highlight reviews for homepage (keep old endpoint)
  getHighlightReviews: () => {
    return axiosClient.get('reviews/highlight/');
  },
};

