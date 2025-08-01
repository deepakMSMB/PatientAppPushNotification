import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../common/axios';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    patient_id: string;
  };
}

const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post('/patients/auth/login', credentials);
  return response.data;
};

export const useLogin = () => {
  return useMutation({
    mutationFn: login,
  });
};

export const loginWithOptions = async (
  credentials: LoginRequest,
  options?: { skipGlobalErrorHandling?: boolean }
): Promise<LoginResponse> => {
  const response = await apiClient.post('/patients/auth/login', credentials, {
    skipGlobalErrorHandling: options?.skipGlobalErrorHandling,
  });
  return response.data;
};
