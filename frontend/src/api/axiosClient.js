import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import { showError } from '../utils/toast';

const axiosClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to check if endpoint is public
const isPublicEndpoint = (url) => {
  if (!url) return false;
  
  // Normalize URL - handle both relative and absolute URLs
  let normalizedUrl = url;
  
  // Remove baseURL if present (absolute URL)
  if (url.includes('http://') || url.includes('https://')) {
    normalizedUrl = url.replace(/^https?:\/\/[^\/]+/, '').replace(/^\/api\//, '');
  }
  
  // Remove leading/trailing slashes for comparison
  normalizedUrl = normalizedUrl.replace(/^\/+|\/+$/g, '');
  
  const publicEndpoints = [
    'categories',
    'courses',
    'auth/student/login',
    'auth/teacher/login',
    'auth/student/register',
    'auth/teacher/register',
  ];
  
  // Check if normalized URL starts with any public endpoint
  const isPublic = publicEndpoints.some(endpoint => {
    // Match: categories, categories/, categories/123/, etc.
    return normalizedUrl === endpoint || normalizedUrl.startsWith(endpoint + '/');
  });
  
  return isPublic;
};

// Request interceptor - attach token
axiosClient.interceptors.request.use(
  (config) => {
    // If FormData, let browser set Content-Type automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    const isPublic = isPublicEndpoint(config.url);
    
    // Debug log for categories endpoint
    if (config.url?.includes('categories')) {
      let normalizedUrl = config.url;
      if (config.url.includes('http://') || config.url.includes('https://')) {
        normalizedUrl = config.url.replace(/^https?:\/\/[^\/]+/, '').replace(/^\/api\//, '');
      }
      normalizedUrl = normalizedUrl.replace(/^\/+|\/+$/g, '');
      
      console.log('🔍 Categories request DEBUG:', {
        originalUrl: config.url,
        normalizedUrl: normalizedUrl,
        baseURL: config.baseURL,
        fullUrl: config.baseURL + config.url,
        isPublic: isPublic,
        hasAuthHeaderBefore: !!config.headers.Authorization,
        willAddAuth: !isPublic,
        publicEndpoints: ['categories', 'courses', 'auth/student/login', 'auth/teacher/login']
      });
    }
    
    // Debug log for teacher endpoints
    if (config.url?.includes('teacher/')) {
      const { accessToken } = useAuthStore.getState();
      console.log('🔐 Teacher endpoint request:', {
        url: config.url,
        method: config.method,
        hasToken: !!accessToken,
        tokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : 'null',
        willAddAuth: !isPublic,
        authHeader: config.headers.Authorization ? 'Bearer ***' : 'none'
      });
    }
    
    // Skip Authorization header for public endpoints
    if (!isPublic) {
      const { accessToken } = useAuthStore.getState();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } else {
      // Explicitly remove Authorization header for public endpoints
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 and refresh token
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Skip token refresh for public endpoints
    if (isPublicEndpoint(originalRequest.url)) {
      return Promise.reject(error);
    }
    
    const { refreshToken, setTokens, logout } = useAuthStore.getState();

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Try to refresh the token
        const response = await axios.post(
          'http://127.0.0.1:8000/api/auth/token/refresh/',
          { refresh: refreshToken }
        );

        const { access } = response.data;
        setTokens({ access, refresh: refreshToken });

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        logout();
        
        showError('Session expired. Please login again');
        
        // Redirect to home after a delay
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
