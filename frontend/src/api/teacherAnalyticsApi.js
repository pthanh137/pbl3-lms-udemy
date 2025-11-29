import axiosClient from './axiosClient';

export const teacherAnalyticsApi = {
  // Get analytics summary
  getSummary: () => {
    return axiosClient.get('teacher/analytics/summary/');
  },

  // Get daily revenue
  getRevenueDaily: (days = 30) => {
    return axiosClient.get(`teacher/analytics/revenue-daily/?days=${days}`);
  },

  // Get daily enrollments
  getEnrollmentsDaily: (days = 30) => {
    return axiosClient.get(`teacher/analytics/enrollments-daily/?days=${days}`);
  },

  // Get course performance
  getCoursePerformance: () => {
    return axiosClient.get('teacher/analytics/course-performance/');
  },
};

