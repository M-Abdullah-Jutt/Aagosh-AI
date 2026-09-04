import apiClient from './api';

export const childrenService = {
  // Children CRUD
  getChildren: async () => {
    const response = await apiClient.get('/children');
    return response.data;
  },

  getChild: async (childId) => {
    const response = await apiClient.get(`/children/${childId}`);
    return response.data;
  },

  createChild: async (childData) => {
    const response = await apiClient.post('/children', childData);
    return response.data;
  },

  updateChild: async (childId, childData) => {
    const response = await apiClient.put(`/children/${childId}`, childData);
    return response.data;
  },

  deleteChild: async (childId) => {
    const response = await apiClient.delete(`/children/${childId}`);
    return response.data;
  },

  // Profile CRUD
  getProfile: async (childId) => {
    const response = await apiClient.get(`/children/${childId}/profile`);
    return response.data;
  },

  updateProfile: async (childId, profileData) => {
    const response = await apiClient.put(`/children/${childId}/profile`, profileData);
    return response.data;
  },

  // Goals CRUD
  getGoals: async (childId) => {
    const response = await apiClient.get(`/children/${childId}/goals`);
    return response.data;
  },

  createGoal: async (childId, goalData) => {
    const response = await apiClient.post(`/children/${childId}/goals`, goalData);
    return response.data;
  },

  updateGoal: async (childId, goalId, goalData) => {
    const response = await apiClient.put(`/children/${childId}/goals/${goalId}`, goalData);
    return response.data;
  },

  deleteGoal: async (childId, goalId) => {
    const response = await apiClient.delete(`/children/${childId}/goals/${goalId}`);
    return response.data;
  },
};

export default childrenService;
