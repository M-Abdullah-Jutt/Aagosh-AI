import apiClient from './api';

/**
 * Service to fetch backend API health status.
 */
export const checkHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    throw error;
  }
};
