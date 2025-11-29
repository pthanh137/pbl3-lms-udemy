import axiosClient from './axiosClient';

export const certificateApi = {
  // Get list of my certificates
  getMyCertificates: () => {
    return axiosClient.get('student/certificates/');
  },

  // Get certificate detail by ID
  getCertificateDetail: (id) => {
    return axiosClient.get(`student/certificates/${id}/`);
  },
};


