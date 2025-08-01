import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

const ACCESS_TOKEN_KEY = 'access_token';
const PATIENT_ID_KEY = 'patient_id';

export const saveAccessToken = (token: string) => {
  storage.set(ACCESS_TOKEN_KEY, token);
};

export const getAccessToken = (): string | null => {
  return storage.getString(ACCESS_TOKEN_KEY) || null;
};

export const clearAccessToken = () => {
  storage.delete(ACCESS_TOKEN_KEY);
};

export const savePatientId = (patientId: string) => {
  storage.set(PATIENT_ID_KEY, patientId);
};

export const getPatientId = (): string | null => {
  return storage.getString(PATIENT_ID_KEY) || null;
};

export const clearPatientId = () => {
  storage.delete(PATIENT_ID_KEY);
};

export const clearAllAuthData = () => {
  clearAccessToken();
  clearPatientId();
};

// FCM Token storage
export const saveFCMToken = (token: string) => {
  storage.set('fcm_token', token);
};

export const getFCMToken = (): string | null => {
  return storage.getString('fcm_token') || null;
};

export const clearFCMToken = () => {
  storage.delete('fcm_token');
}; 