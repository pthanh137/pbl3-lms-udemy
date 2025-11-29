import axiosClient from './axiosClient';

export const studentApi = {
  // Enrollment
  enroll: (courseId) => {
    return axiosClient.post('student/enroll/', { course: courseId });
  },

  getMyCourses: () => {
    return axiosClient.get('student/courses/');
  },

  getCourseContent: (courseId) => {
    return axiosClient.get(`student/courses/${courseId}/content/`);
  },

  // Quiz
  getQuiz: (quizId) => {
    return axiosClient.get(`student/quiz/${quizId}/`);
  },

  submitQuiz: (quizId, answers) => {
    return axiosClient.post(`student/quiz/${quizId}/submit/`, { answers });
  },

  getQuizAttempts: () => {
    return axiosClient.get('student/quiz/attempts/');
  },

  // Lesson Progress
  updateLessonProgress: (lessonId, watchedSeconds, completed = false) => {
    return axiosClient.post('student/lesson-progress/', {
      lesson_id: lessonId,
      watched_seconds: watchedSeconds,
      completed: completed,
    });
  },
};



