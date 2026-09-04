import apiClient from './api';

export const authService = {
  /**
   * Register a new parent user.
   */
  register: async ({ full_name, email, password }) => {
    const response = await apiClient.post('/auth/register', {
      full_name,
      email,
      password,
    });
    return response.data;
  },

  /**
   * Log in existing parent user and retrieve access token.
   */
  login: async ({ email, password }) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Fetch profile of currently authenticated parent user.
   */
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export default authService;
