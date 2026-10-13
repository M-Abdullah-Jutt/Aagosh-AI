import api from './api';

export const parentPracticeService = {
  /**
   * Fetch all curated parenting practice scenarios
   */
  async getScenarios() {
    const response = await api.get('/practice/scenarios');
    return response.data;
  },

  /**
   * Send parent's response to the virtual child and receive
   * the child's reaction + AI coach whisper guidance
   */
  async sendTurn({
    scenarioId,
    childName,
    childAge,
    behaviorType,
    transcript = [],
    parentResponse,
    language = 'en',
  }) {
    const response = await api.post('/practice/turn', {
      scenario_id: scenarioId,
      child_name: childName,
      child_age: childAge,
      behavior_type: behaviorType,
      transcript,
      parent_response: parentResponse,
      language,
    });
    return response.data;
  },

  /**
   * Request full AI Coach debrief report analyzing parent mistakes,
   * wrong behaviors, successes, and golden recommendations
   */
  async getDebrief({
    scenarioId,
    scenarioTitle,
    childName,
    childAge,
    behaviorType,
    transcript = [],
    durationSeconds = 180,
    language = 'en',
  }) {
    const response = await api.post('/practice/debrief', {
      scenario_id: scenarioId,
      scenario_title: scenarioTitle,
      child_name: childName,
      child_age: childAge,
      behavior_type: behaviorType,
      transcript,
      duration_seconds: durationSeconds,
      language,
    });
    return response.data;
  },
};

export default parentPracticeService;
