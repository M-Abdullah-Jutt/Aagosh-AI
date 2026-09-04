import api from './api';

export const analyticsService = {
  /**
   * Fetch deterministic behavior analytics summary for a child
   * @param {string} childId 
   * @param {string} period - '7d' | '14d' | '30d' | 'all'
   */
  async getAnalyticsSummary(childId, period = '7d') {
    const response = await api.get(`/children/${childId}/analytics/summary`, {
      params: { period }
    });
    return response.data;
  }
};

export default analyticsService;
