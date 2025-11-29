import axiosClient from './axiosClient';

export const paymentApi = {
  // Create order for a course
  createOrder: (courseId) => {
    return axiosClient.post('payment/create-order/', { course_id: courseId });
  },

  // Confirm fake payment
  fakeConfirm: (orderId) => {
    return axiosClient.post('payment/fake-confirm/', { order_id: orderId });
  },

  // Get payment status
  getStatus: (orderId) => {
    return axiosClient.get(`payment/status/${orderId}/`);
  },
};

