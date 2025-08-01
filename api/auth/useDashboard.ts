import { setAuthHeaders } from '@api/common/axios';
import type { AxiosError } from 'axios';
import axios from 'axios';
import { createQuery } from 'react-query-kit';


export interface PatientDetails {
    patient_id: string;
    patient_email: string;
    patient_mobile: string;
    patient_country_code: string;
    relation_id: string;
    relation_title: string;
    relation_first_name: string;
    relation_sur_name: string;
    relation_dob: string;
    relation_gender: string;
    relation_address_line_1: string;
    relation_address_line_2: string;
    relation_city: string;
    relation_postal_code: string;
    relation_country: string;
    relation_ids: string[] | null;
  }
  
  export interface PrescriptionData {
    relation_id: string;
    prescription_id: string;
    prescription_code: string;
    prescription_created_at: string;
    patient_id: string;
    relation_title: string;
    relation_first_name: string;
    relation_sur_name: string;
    relation_gender: string;
    relation_type: string;
    prescription_status: string;
    prescriber_id: string;
    prescriber_title: string;
    prescriber_first_name: string;
    prescriber_sur_name: string;
    pharmacy_name?: string;
  }
  
  export interface DashboardResponse {
    success: boolean;
    message: string;
    data: {
      prescription?: PrescriptionData;
      other_prescription?: PrescriptionData[];
      patientDetails: PatientDetails;
    };
  }

// Create the query hook for fetching dashboard data
export const useDashboard = createQuery<DashboardResponse, void, AxiosError>({
  queryKey: ['dashboard'],
  fetcher: async () => {
    setAuthHeaders(); // Ensure token is set
    try {
      // This will use global error handling (default behavior)
      const res = await axios.get('/patients/dashboard');
      return res.data;
    } catch (error) {
      console.error('Dashboard API error:', error);
      throw error;
    }
  },
});

// Example of a query that skips global error handling
export const useDashboardSilent = createQuery<DashboardResponse, void, AxiosError>({
  queryKey: ['dashboard-silent'],
  fetcher: async () => {
    setAuthHeaders(); // Ensure token is set
    try {
      // This will skip global error handling and let the component handle errors
      const res = await axios.get('/patients/dashboard', {
        skipGlobalErrorHandling: true,
      });
      return res.data;
    } catch (error) {
      console.error('Dashboard API error (silent):', error);
      throw error;
    }
  },
});

// Example of a query that explicitly shows toasts for errors
export const useDashboardWithToast = createQuery<DashboardResponse, void, AxiosError>({
  queryKey: ['dashboard-toast'],
  fetcher: async () => {
    setAuthHeaders(); // Ensure token is set
    try {
      // This will show toasts for all errors (including 400s)
      const res = await axios.get('/patients/dashboard', {
        showToastOnError: true,
      });
      return res.data;
    } catch (error) {
      console.error('Dashboard API error (with toast):', error);
      throw error;
    }
  },
});
