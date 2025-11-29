import axios from 'axios';

// Use plain axios for auth endpoints to avoid interceptor issues during login
const authAxios = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  // Student authentication
  studentRegister: (data) => {
    return authAxios.post('auth/student/register/', data);
  },

  studentLogin: (data) => {
    return authAxios.post('auth/student/login/', data);
  },

  // Teacher authentication
  teacherRegister: (data) => {
    return authAxios.post('auth/teacher/register/', data);
  },

  teacherLogin: (data) => {
    return authAxios.post('auth/teacher/login/', data);
  },
};
