import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../common/axios';
import { Platform } from 'react-native';

interface FCMTokenRequest {
  fcm_token: string;
  device_id: string;
}

interface FCMTokenResponse {
  success: boolean;
  message: string;
  data?: {
    token_id: string;
    updated_at: string;
  };
}

const updateFCMTokenAPI = async (tokenData: FCMTokenRequest): Promise<FCMTokenResponse> => {
  const response = await apiClient.post('/patients/fcm-token', tokenData);
  return response.data;
};

export const useUpdateFCMToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFCMTokenAPI,
    onSuccess: (data) => {
      console.log('FCM token updated successfully:', data);
      // Invalidate any related queries if needed
      queryClient.invalidateQueries({ queryKey: ['user', 'notifications'] });
    },
    onError: (error) => {
      console.error('Failed to update FCM token:', error);
    },
  });
};

// Function to get device identifier
export const getDeviceIdentifier = (): string => {
  // You might want to use a more sophisticated device ID
  // For now, using platform as identifier
  return Platform.OS === 'ios' ? 'ios' : 'android';
}; 