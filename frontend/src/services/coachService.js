import api from './api';

export const coachService = {
  /**
   * Create a new coach conversation session
   * @param {number|string} childId 
   * @param {string|null} title 
   */
  async createConversation(childId, title = null) {
    const response = await api.post(`/children/${childId}/coach/conversations`, { title });
    return response.data;
  },

  /**
   * Auto-initialize a conversation with a personalized AI welcome message
   * @param {number|string} childId
   * @param {string} conversationId
   */
  async initializeConversation(childId, conversationId) {
    const response = await api.post(
      `/children/${childId}/coach/conversations/${conversationId}/initialize`
    );
    return response.data;
  },

  /**
   * Get all active conversations for a child
   * @param {number|string} childId 
   */
  async getConversations(childId) {
    const response = await api.get(`/children/${childId}/coach/conversations`);
    return response.data;
  },

  /**
   * Get conversation details and message history
   * @param {number|string} childId 
   * @param {string} conversationId 
   * @param {number} limit 
   * @param {number} offset 
   */
  async getConversationDetail(childId, conversationId, limit = 50, offset = 0) {
    const response = await api.get(`/children/${childId}/coach/conversations/${conversationId}`, {
      params: { limit, offset }
    });
    return response.data;
  },

  /**
   * Archive/soft-delete a conversation
   * @param {number|string} childId 
   * @param {string} conversationId 
   */
  async archiveConversation(childId, conversationId) {
    const response = await api.delete(`/children/${childId}/coach/conversations/${conversationId}`);
    return response.data;
  },

  /**
   * Send a message within a conversation session
   * @param {number|string} childId 
   * @param {string} conversationId 
   * @param {string} message 
   * @param {string} period 
   */
  async sendMessage(childId, conversationId, message, period = '30d') {
    const response = await api.post(`/children/${childId}/coach/conversations/${conversationId}/messages`, {
      message,
      period
    });
    return response.data;
  },

  /**
   * Submit a direct parent question (legacy/dev endpoint)
   * @param {number|string} childId 
   * @param {string} message 
   * @param {string} period 
   */
  async askCoach(childId, message, period = '30d') {
    const response = await api.post(`/children/${childId}/coach`, {
      message,
      period
    });
    return response.data;
  }
};

export default coachService;
