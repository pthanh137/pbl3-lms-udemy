import Swal from 'sweetalert2';

const toastConfig = {
  position: 'top-end',
  showConfirmButton: false,
  timer: 1500,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
};

export const showSuccess = (message) => {
  Swal.fire({
    ...toastConfig,
    icon: 'success',
    title: message,
    toast: true,
    background: '#10b981',
    color: '#ffffff',
  });
};

export const showError = (message) => {
  Swal.fire({
    ...toastConfig,
    icon: 'error',
    title: message,
    toast: true,
    background: '#ef4444',
    color: '#ffffff',
  });
};

export const showWarning = (message) => {
  Swal.fire({
    ...toastConfig,
    icon: 'warning',
    title: message,
    toast: true,
    background: '#f59e0b',
    color: '#ffffff',
  });
};

export const showInfo = (message) => {
  Swal.fire({
    ...toastConfig,
    icon: 'info',
    title: message,
    toast: true,
    background: '#3b82f6',
    color: '#ffffff',
  });
};



