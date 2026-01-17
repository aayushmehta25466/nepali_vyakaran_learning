import axios from 'axios';

/**
 * API Client Configuration
 * 
 * This file sets up axios with:
 * 1. Base URL pointing to Django backend
 * 2. Request interceptors to attach JWT tokens
 * 3. Response interceptors to handle errors
 * 4. Token refresh logic for expired tokens
 */

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for requests (increased for email sending during registration)
});

/**
 * REQUEST INTERCEPTOR
 * 
 * This runs BEFORE every API request
 * Purpose: Automatically add JWT token to Authorization header
 * 
 * How it works:
 * - Gets token from localStorage
 * - If token exists, adds it to request header as "Bearer <token>"
 * - This way, every API request is authenticated automatically
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      // Add Bearer token to Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`📤 API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 * 
 * This runs AFTER every API response
 * Purpose: Handle success, errors, and token refresh
 * 
 * Steps:
 * 1. If response is successful (2xx status): return data
 * 2. If 401 (Unauthorized): Token expired, try to refresh it
 * 3. If other errors: Log and reject
 */
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log('🔄 Token expired, attempting to refresh...');
        
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          // No refresh token, redirect to login
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Call refresh endpoint
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1'}/auth/refresh-token/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        
        // Update stored token
        localStorage.setItem('access_token', access);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh failed');
        // Clear stored tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      console.error(
        `❌ API Error: ${error.response.status}`,
        error.response.data
      );
    } else if (error.request) {
      console.error('❌ No response from server:', error.request);
    } else {
      console.error('❌ Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
