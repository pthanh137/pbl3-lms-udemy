import axiosClient from './axiosClient';

export const authApi = {
  // Student login
  studentLogin: (credentials) => {
    return axiosClient.post('auth/student/login/', credentials);
  },

  // Student register
  studentRegister: (data) => {
    return axiosClient.post('auth/student/register/', data);
  },

  // Teacher login
  teacherLogin: (credentials) => {
    return axiosClient.post('auth/teacher/login/', credentials);
  },

  // Teacher register
  teacherRegister: (data) => {
    return axiosClient.post('auth/teacher/register/', data);
  },

  // Get student profile
  getProfile: () => {
    return axiosClient.get('auth/profile/');
  },

  // Update student profile
  updateProfile: (data) => {
    return axiosClient.put('auth/profile/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Change password
  changePassword: (oldPassword, newPassword) => {
    return axiosClient.post('auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },
};
