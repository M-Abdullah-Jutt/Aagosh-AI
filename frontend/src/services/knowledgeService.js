import api from './api';

export const knowledgeService = {
  /**
   * Search knowledge base for source-grounded CDC parenting protocols
   * @param {Object} params - { query, age, category, tags, top_k }
   */
  async searchKnowledge({ query, age, category, tags, top_k = 5 }) {
    const response = await api.post('/knowledge/search', {
      query,
      age: age !== undefined && age !== '' ? Number(age) : null,
      category: category || null,
      tags: tags || null,
      top_k: Number(top_k) || 5
    });
    return response.data;
  },

  /**
   * Trigger idempotent knowledge ingestion
   */
  async triggerIngestion() {
    const response = await api.post('/knowledge/ingest');
    return response.data;
  }
};

export default knowledgeService;
