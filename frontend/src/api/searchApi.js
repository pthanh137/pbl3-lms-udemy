import axiosClient from './axiosClient';

export const searchApi = {
  // Search courses with filters
  searchCourses: (params) => {
    const queryParams = new URLSearchParams();
    
    if (params.q) queryParams.append('q', params.q);
    if (params.category) queryParams.append('category', params.category);
    if (params.price) queryParams.append('price', params.price);
    if (params.level) queryParams.append('level', params.level);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.page) queryParams.append('page', params.page);
    
    return axiosClient.get(`search/?${queryParams.toString()}`);
  },

  // Get recommended courses
  getRecommendations: () => {
    return axiosClient.get('courses/recommend/');
  },
};

