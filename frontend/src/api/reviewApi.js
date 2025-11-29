import axiosClient from './axiosClient';

export const reviewApi = {
  // Add or update a review
  addReview: (courseId, rating, comment) => {
    return axiosClient.post('reviews/add/', {
      course_id: courseId,
      rating: rating,
      comment: comment || '',
    });
  },

  // Get all reviews for a course
  getCourseReviews: (courseId) => {
    return axiosClient.get(`reviews/course/${courseId}/`);
  },

  // Get current student's review for a course
  getMyReview: (courseId) => {
    return axiosClient.get(`reviews/my/${courseId}/`);
  },

  // Delete current student's review
  deleteReview: (courseId) => {
    return axiosClient.delete(`reviews/delete/${courseId}/`);
  },
};

