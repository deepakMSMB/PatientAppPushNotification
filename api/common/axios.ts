import { clearAccessToken, getAccessToken } from '@utils/mmkvStore';
import type { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import axios from 'axios';
import mitt from 'mitt';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_ERROR_NOTIFICATION = 'Something went wrong!';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Set the base URL from environment variable or default to development
const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'https://dev.api.doctorondial.com';

console.log('API URL configured:', apiUrl);

axios.defaults.baseURL = apiUrl;

// Export the axios instance as apiClient
export const apiClient = axios;

interface ErrorResponseType {
  message: string;
  status?: number;
  error?: string;
  success?: boolean;
}

interface RetryConfig {
  retries: number;
  retryDelay: number;
}

// Add a flag to track if error should be handled globally
export interface AxiosRequestConfigWithErrorHandling extends AxiosRequestConfig {
  skipGlobalErrorHandling?: boolean;
  showToastOnError?: boolean;
}

// Extend the global axios module to include our custom properties
declare module 'axios' {
  interface AxiosRequestConfig {
    skipGlobalErrorHandling?: boolean;
    showToastOnError?: boolean;
  }
}

const resetAxiosAuthTokens = () => {
  // console.log('resetAxiosAuthTokens: Clearing access token');
  delete axios.defaults.headers['Authorization'];
  clearAccessToken();
};

const setAuthHeaders = () => {
  axios.defaults.baseURL = apiUrl;
  axios.defaults.headers['Accept'] = 'application/json';
  axios.defaults.headers['Content-Type'] = 'application/json';

  const token = getAccessToken();
  console.log('token', token);
  if (token) {
    axios.defaults.headers['Authorization'] = `Bearer ${token}`;
  }
};

const handleSuccessResponse = (response: AxiosResponse) => response;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryRequest = async (error: AxiosError, config: RetryConfig): Promise<AxiosResponse> => {
  const { retries, retryDelay } = config;

  if (retries <= 0) {
    return Promise.reject(error);
  }

  // Wait before retrying
  await sleep(retryDelay);

  // Retry the request
  return axios({
    ...error.config,
    headers: {
      ...error.config?.headers,
      'X-Retry-Count': (MAX_RETRIES - retries + 1).toString(),
    },
  });
};

export const globalEventBus = mitt();

const getErrorUrl = (axiosErrorObject: AxiosError) =>
  axiosErrorObject.config?.url || '[unknown url]';

const getErrorMethod = (axiosErrorObject: AxiosError) =>
  axiosErrorObject.config?.method || '[unknown method]';

const handleErrorResponse = async (axiosErrorObject: AxiosError) => {
  const config = axiosErrorObject.config as AxiosRequestConfigWithErrorHandling;
  const skipGlobalErrorHandling = config?.skipGlobalErrorHandling;
  const showToastOnError = config?.showToastOnError;

  // Check if this is a 404 with success: true (valid business response)
  const errorResponse = axiosErrorObject.response?.data as ErrorResponseType;
  if (axiosErrorObject.response?.status === 404 && errorResponse?.success === true) {
    // This is a valid business response, not an error
    // Return the response as if it was successful
    return Promise.resolve({
      data: errorResponse,
      status: 200, // Treat as success
      statusText: 'OK',
      headers: axiosErrorObject.response.headers,
      config: axiosErrorObject.config,
    });
  }

  // Add detailed logging for debugging (only for non-skipped errors)
  if (!skipGlobalErrorHandling) {
    console.error('AXIOS ERROR:', {
      url: getErrorUrl(axiosErrorObject),
      method: getErrorMethod(axiosErrorObject),
      data: axiosErrorObject.config?.data,
      status: axiosErrorObject.response?.status,
      response: axiosErrorObject.response?.data,
    });
  }

  // Handle token-related errors (401, 403, and 400 with Invalid Token) - ALWAYS handle globally
  if (
    axiosErrorObject.response?.status === 401 ||
    axiosErrorObject.response?.status === 403 ||
    (axiosErrorObject.response?.status === 400 && errorResponse?.message === 'Invalid Token')
  ) {
    // Clear user data and tokens
    resetAxiosAuthTokens();

    // Show global error (navigation handled by event bus)
    console.log('handleErrorResponse: Emitting globalError event for logout', {
      status: axiosErrorObject.response?.status,
      message: errorResponse?.message,
    });
    globalEventBus.emit('globalError', {
      message:
        axiosErrorObject.response.status === 401
          ? 'Your session has expired. Please login again.'
          : axiosErrorObject.response.status === 403
            ? "You don't have permission to access this resource."
            : 'Invalid token. Please login again.',
      type: 'error',
      shouldLogout: true,
      status: axiosErrorObject.response.status,
    });

    // Return a specific error message for token issues
    return Promise.reject({
      message:
        axiosErrorObject.response.status === 401
          ? 'Your session has expired. Please login again.'
          : axiosErrorObject.response.status === 403
            ? "You don't have permission to access this resource."
            : 'Invalid token. Please login again.',
      status: axiosErrorObject.response.status,
      isAuthError: true,
    });
  }

  // Handle 502/503 errors (server maintenance) - navigate to try again screen
  if (axiosErrorObject.response?.status === 502 || axiosErrorObject.response?.status === 503) {
    // Don't clear tokens for 502/503 errors as they indicate server maintenance
    console.log('handleErrorResponse: Emitting serverDown event for server maintenance', {
      status: axiosErrorObject.response?.status,
      message: errorResponse?.message,
    });
    globalEventBus.emit('serverDown');
    return Promise.reject({
      message: 'Server is temporarily unavailable. Please try again later.',
      status: axiosErrorObject.response.status,
      isAuthError: false,
    });
  }

  // Handle network errors with retry - ALWAYS handle globally
  if (!axiosErrorObject.response) {
    const retryCount = parseInt(axiosErrorObject.config?.headers?.['X-Retry-Count'] || '0');

    if (retryCount < MAX_RETRIES) {
      try {
        const response = await retryRequest(axiosErrorObject, {
          retries: MAX_RETRIES - retryCount,
          retryDelay: RETRY_DELAY * (retryCount + 1), // Exponential backoff
        });
        return response;
      } catch (retryError) {
        const message = 'Network error. Please check your connection and try again.';
        if (!skipGlobalErrorHandling) {
          globalEventBus.emit('toasterError', {
            message,
            url: getErrorUrl(axiosErrorObject),
          });
          console.error(`[AXIOS TOASTER ERROR] ${getErrorUrl(axiosErrorObject)}: ${message}`);
        }
        return Promise.reject({
          message,
          retryError,
          status: 0,
          retryCount: retryCount + 1,
          canRetry: retryCount + 1 < MAX_RETRIES,
          isAuthError: false,
        });
      }
    }

    const message = 'Network error. Please check your connection and try again.';
    if (!skipGlobalErrorHandling) {
      globalEventBus.emit('toasterError', {
        message,
        url: getErrorUrl(axiosErrorObject),
      });
      console.error(`[AXIOS TOASTER ERROR] ${getErrorUrl(axiosErrorObject)}: ${message}`);
    }
    return Promise.reject({
      message,
      status: 0,
      retryCount: MAX_RETRIES,
      canRetry: false,
      isAuthError: false,
    });
  }

  // Handle server errors (500+) - ALWAYS handle globally (excluding 502/503 which are handled above)
  if (
    axiosErrorObject.response?.status &&
    axiosErrorObject.response.status >= 500 &&
    axiosErrorObject.response.status !== 502 &&
    axiosErrorObject.response.status !== 503
  ) {
    // Show global error and trigger logout
    const errorMessage = 'Server error. Please try again later.';
    globalEventBus.emit('globalError', {
      message: errorMessage,
      type: 'error',
      shouldLogout: true,
    });
    // Emit toaster error and log
    if (!skipGlobalErrorHandling) {
      globalEventBus.emit('toasterError', {
        message: errorMessage,
        url: getErrorUrl(axiosErrorObject),
      });
      console.error(`[AXIOS TOASTER ERROR] ${getErrorUrl(axiosErrorObject)}: ${errorMessage}`);
    }
    return Promise.reject({
      message: errorMessage,
      status: axiosErrorObject.response.status,
      isAuthError: false,
    });
  }

  // Handle other errors (400, 404, etc.) - Only handle if not skipped
  const errorMessage = errorResponse?.message || DEFAULT_ERROR_NOTIFICATION;
  const errorUrl = getErrorUrl(axiosErrorObject);

  // Only show toast if explicitly requested or if global handling is not skipped
  if (showToastOnError || !skipGlobalErrorHandling) {
    globalEventBus.emit('toasterError', {
      message: errorMessage,
      url: errorUrl,
    });
    console.error(`[AXIOS TOASTER ERROR] ${errorUrl}: ${errorMessage}`);
  }

  return Promise.reject({
    message: errorMessage,
    status: axiosErrorObject.response.status,
    isAuthError: false,
  });
};

const registerAxiosIntercepts = () => {
  axios.interceptors.response.use(handleSuccessResponse, handleErrorResponse);
};

export { registerAxiosIntercepts, resetAxiosAuthTokens, setAuthHeaders };

// Add FCM token update function
export const updateFCMToken = async (fcmToken: string) => {
  try {
    const response = await apiClient.post('/patients/fcm-token', {
      fcm_token: fcmToken,
      device_id: Platform.OS === 'ios' ? 'ios' : 'android' // You might want to use a more unique device identifier
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update FCM token on backend:', error);
    throw error;
  }
};
