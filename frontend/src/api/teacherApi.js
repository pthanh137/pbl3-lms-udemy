import axiosClient from './axiosClient';

export const teacherApi = {
  // Courses
  getCourses: () => {
    return axiosClient.get('teacher/courses/');
  },

  getCourse: (id) => {
    return axiosClient.get(`teacher/courses/${id}/`);
  },

  createCourse: (data) => {
    return axiosClient.post('teacher/courses/', data);
  },

  updateCourse: (id, data) => {
    return axiosClient.put(`teacher/courses/${id}/`, data);
  },

  deleteCourse: (id) => {
    return axiosClient.delete(`teacher/courses/${id}/`);
  },

  // Sections
  getSections: (courseId) => {
    return axiosClient.get('teacher/sections/', { params: { course: courseId } });
  },

  getSection: (id) => {
    return axiosClient.get(`teacher/sections/${id}/`);
  },

  createSection: (data) => {
    return axiosClient.post('teacher/sections/', data);
  },

  updateSection: (id, data) => {
    return axiosClient.put(`teacher/sections/${id}/`, data);
  },

  deleteSection: (id) => {
    return axiosClient.delete(`teacher/sections/${id}/`);
  },

  // Lessons
  getLessons: (sectionId) => {
    return axiosClient.get('teacher/lessons/', { params: { section: sectionId } });
  },

  getAllLessons: () => {
    return axiosClient.get('teacher/lessons/');
  },

  getLesson: (id) => {
    return axiosClient.get(`teacher/lessons/${id}/`);
  },

  createLesson: (data) => {
    // If data is FormData, it will be sent as multipart/form-data
    // Otherwise, send as JSON
    if (data instanceof FormData) {
      return axiosClient.post('teacher/lessons/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return axiosClient.post('teacher/lessons/', data);
  },

  updateLesson: (id, data) => {
    // If data is FormData, it will be sent as multipart/form-data
    // Otherwise, send as JSON
    if (data instanceof FormData) {
      return axiosClient.put(`teacher/lessons/${id}/`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return axiosClient.put(`teacher/lessons/${id}/`, data);
  },

  deleteLesson: (id) => {
    return axiosClient.delete(`teacher/lessons/${id}/`);
  },

  // Quizzes
  getQuizzes: (courseId) => {
    return axiosClient.get('teacher/quizzes/', { params: { course: courseId } });
  },

  getQuiz: (id) => {
    return axiosClient.get(`teacher/quizzes/${id}/`);
  },

  createQuiz: (data) => {
    return axiosClient.post('teacher/quizzes/', data);
  },

  updateQuiz: (id, data) => {
    return axiosClient.put(`teacher/quizzes/${id}/`, data);
  },

  deleteQuiz: (id) => {
    return axiosClient.delete(`teacher/quizzes/${id}/`);
  },

  // Questions
  getQuestions: (quizId) => {
    return axiosClient.get('teacher/questions/', { params: { quiz: quizId } });
  },

  getQuestion: (id) => {
    return axiosClient.get(`teacher/questions/${id}/`);
  },

  createQuestion: (data) => {
    return axiosClient.post('teacher/questions/', data);
  },

  updateQuestion: (id, data) => {
    return axiosClient.put(`teacher/questions/${id}/`, data);
  },

  deleteQuestion: (id) => {
    return axiosClient.delete(`teacher/questions/${id}/`);
  },

  // Options
  getOptions: (questionId) => {
    return axiosClient.get('teacher/options/', { params: { question: questionId } });
  },

  getOption: (id) => {
    return axiosClient.get(`teacher/options/${id}/`);
  },

  createOption: (data) => {
    return axiosClient.post('teacher/options/', data);
  },

  updateOption: (id, data) => {
    return axiosClient.put(`teacher/options/${id}/`, data);
  },

  deleteOption: (id) => {
    return axiosClient.delete(`teacher/options/${id}/`);
  },

  // Profile
  getProfile: () => {
    return axiosClient.get('teacher/profile/');
  },

  updateProfile: (data) => {
    return axiosClient.put('teacher/profile/', data);
  },

  // Change Password
  changePassword: (data) => {
    return axiosClient.post('teacher/change-password/', data);
  },

  // Student Progress Tracking
  getCourseStudents: (courseId, params = {}) => {
    return axiosClient.get(`teacher/courses/${courseId}/students/`, { params });
  },

  getStudentDetail: (courseId, studentId) => {
    return axiosClient.get(`teacher/courses/${courseId}/students/${studentId}/detail/`);
  },

  getCourseAnalytics: (courseId) => {
    return axiosClient.get(`teacher/courses/${courseId}/analytics/`);
  },
};



