import api from './api';

export const feedbackService = {
  /**
   * Submit helpful/not helpful feedback with optional rating & comment
   * @param {Object} params
   * @param {'ai_chat_coach' | 'parent_practice'} params.module
   * @param {boolean} params.isHelpful
   * @param {string} [params.targetId]
   * @param {string} [params.childId]
   * @param {number} [params.rating]
   * @param {string} [params.comment]
   */
  async submitFeedback({ module, isHelpful, targetId = null, childId = null, rating = null, comment = null }) {
    const response = await api.post('/feedback', {
      module,
      is_helpful: isHelpful,
      target_id: targetId,
      child_id: childId ? String(childId) : null,
      rating,
      comment,
    });
    return response.data;
  },
};

export default feedbackService;
