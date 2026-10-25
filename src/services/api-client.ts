import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiError, parseAxiosErrorData } from '../utils/errors';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor for logging or auth token injection if needed in future
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  },
);

// Response interceptor to normalize errors into ApiError instances
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Backend returned an error response (4xx, 5xx)
      const apiError = parseAxiosErrorData(error.response.status, error.response.data);
      return Promise.reject(apiError);
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return Promise.reject(
        new ApiError(
          408,
          'TIMEOUT',
          'The server is taking too long to respond. Please check that the backend is running.',
        ),
      );
    } else if (error.request) {
      // Network error or backend server down
      return Promise.reject(
        new ApiError(
          0,
          'NETWORK_ERROR',
          'Unable to connect to the backend server. Please verify it is running on ' + API_BASE_URL,
        ),
      );
    }

    return Promise.reject(
      new ApiError(500, 'UNEXPECTED_ERROR', error.message || 'An unexpected error occurred'),
    );
  },
);

export default apiClient;
