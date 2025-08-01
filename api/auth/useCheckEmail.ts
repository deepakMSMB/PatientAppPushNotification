import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../common/axios';

interface CheckEmailRequest {
  email: string;
}

interface CheckEmailResponse {
  success: boolean;
  message: string;
  data?: any;
}

const checkEmail = async (request: CheckEmailRequest): Promise<CheckEmailResponse> => {
  const response = await apiClient.post('/patients/email/check', request);
  return response.data;
};

export const useCheckEmail = () => {
  return useMutation({
    mutationFn: checkEmail,
  });
};
