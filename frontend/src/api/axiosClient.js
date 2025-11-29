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
  
  // Special handling FIRST: courses/{id}/review/ (POST) requires authentication
  // This must be checked BEFORE checking if it starts with 'courses'
  // Check for exact pattern: courses/{number}/review/ (not /reviews/)
  const reviewPostPattern = /^courses\/\d+\/review\/?$/;
  if (reviewPostPattern.test(normalizedUrl)) {
    // This is a POST/PUT/DELETE review endpoint, requires auth
    console.log('🔐 Review POST endpoint detected (requires auth):', normalizedUrl);
    return false;
  }
  
  const publicEndpoints = [
    'categories',
    'courses',  // Public GET endpoints for courses
    'auth/student/login',
    'auth/teacher/login',
    'auth/student/register',
    'auth/teacher/register',
    'reviews/highlight', // Public endpoint for homepage highlight reviews
    'reviews/home',      // Public endpoint for homepage latest reviews
  ];
  
  // Check if normalized URL starts with any public endpoint
  const isPublic = publicEndpoints.some(endpoint => {
    // Match: categories, categories/, categories/123/, etc.
    // But exclude courses/{id}/review/ (POST endpoint)
    if (endpoint === 'courses') {
      // If it's a review POST endpoint, it's not public
      if (reviewPostPattern.test(normalizedUrl)) {
        return false;
      }
    }
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
    
    // Normalize URL for debugging
    let normalizedUrl = config.url || '';
    if (normalizedUrl.includes('http://') || normalizedUrl.includes('https://')) {
      normalizedUrl = normalizedUrl.replace(/^https?:\/\/[^\/]+/, '').replace(/^\/api\//, '');
    }
    normalizedUrl = normalizedUrl.replace(/^\/+|\/+$/g, '');
    
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
    
    // ALWAYS add token for review POST endpoints, regardless of isPublic check
    if (config.url?.includes('/review/') && !config.url?.includes('/reviews/') && config.method?.toUpperCase() === 'POST') {
      const { accessToken } = useAuthStore.getState();
      console.log('🔐 Review POST endpoint - Force adding token:', {
        url: config.url,
        method: config.method,
        hasToken: !!accessToken,
        tokenPreview: accessToken ? accessToken.substring(0, 30) + '...' : 'null',
        isPublic: isPublic
      });
      
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        console.log('✅ Token added to review request');
      } else {
        console.error('❌ No access token found for review request!');
        console.error('Auth store state:', useAuthStore.getState());
      }
      return config; // Return early, don't process further
    }
    
    // Debug log for review endpoints BEFORE checking isPublic
    if (config.url?.includes('/review/') && !config.url?.includes('/reviews/')) {
      console.log('🔍 Review endpoint check:', {
        originalUrl: config.url,
        normalizedUrl: normalizedUrl,
        isPublic: isPublic,
        method: config.method
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
