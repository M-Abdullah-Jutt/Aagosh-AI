import apiClient from './api';

export const checkInService = {
  // Daily Check-Ins CRUD
  getCheckIns: async (childId) => {
    const response = await apiClient.get(`/children/${childId}/check-ins`);
    return response.data;
  },

  getCheckIn: async (childId, checkInId) => {
    const response = await apiClient.get(`/children/${childId}/check-ins/${checkInId}`);
    return response.data;
  },

  createCheckIn: async (childId, checkInData) => {
    const response = await apiClient.post(`/children/${childId}/check-ins`, checkInData);
    return response.data;
  },

  updateCheckIn: async (childId, checkInId, checkInData) => {
    const response = await apiClient.put(`/children/${childId}/check-ins/${checkInId}`, checkInData);
    return response.data;
  },

  deleteCheckIn: async (childId, checkInId) => {
    const response = await apiClient.delete(`/children/${childId}/check-ins/${checkInId}`);
    return response.data;
  },

  // Behavior Events CRUD
  getEvents: async (childId, checkInId) => {
    const response = await apiClient.get(`/children/${childId}/check-ins/${checkInId}/events`);
    return response.data;
  },

  createEvent: async (childId, checkInId, eventData) => {
    const response = await apiClient.post(`/children/${childId}/check-ins/${checkInId}/events`, eventData);
    return response.data;
  },

  updateEvent: async (childId, checkInId, eventId, eventData) => {
    const response = await apiClient.put(`/children/${childId}/check-ins/${checkInId}/events/${eventId}`, eventData);
    return response.data;
  },

  deleteEvent: async (childId, checkInId, eventId) => {
    const response = await apiClient.delete(`/children/${childId}/check-ins/${checkInId}/events/${eventId}`);
    return response.data;
  },
};

export default checkInService;
