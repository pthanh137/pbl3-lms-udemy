import axiosClient from './axiosClient';

export const publicApi = {
  // Categories
  getCategories: () => {
    return axiosClient.get('categories/');
  },

  getCategory: (id) => {
    return axiosClient.get(`categories/${id}/`);
  },

  // Courses
  getCourses: (params = {}) => {
    return axiosClient.get('courses/', { params });
  },

  getCourse: (id) => {
    return axiosClient.get(`courses/${id}/`);
  },

  getCourseContent: (id) => {
    return axiosClient.get(`courses/${id}/content/`);
  },

  // Teachers
  getTeachers: (params = {}) => {
    return axiosClient.get('public/teachers/', { params });
  },
};



