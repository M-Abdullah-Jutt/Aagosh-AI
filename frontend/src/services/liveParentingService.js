import api from './api';

export const liveParentingService = {
  /**
   * Request live split-second guidance based on recent parent-child conversation
   */
  async getGuidance({
    childId = null,
    transcript = [],
    latestUtterance,
    latestSpeaker = 'child',
    mode = 'non_human',
    language = 'en'
  }) {
    const response = await api.post('/live-parenting/guide', {
      child_id: childId ? String(childId) : null,
      transcript,
      latest_utterance: latestUtterance,
      latest_speaker: latestSpeaker,
      mode,
      language
    });
    return response.data;
  },

  /**
   * Transcribe recorded audio chunk using Whisper (Groq whisper-large-v3-turbo, 100% free)
   */
  async transcribeAudio(audioBlob, filename = 'speech.webm') {
    const formData = new FormData();
    formData.append('file', audioBlob, filename);

    const response = await api.post('/live-parenting/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Initialize a Simli AI WebRTC avatar session (strict 5-minute cap)
   */
  async getSimliSession({ faceId = null, apiKey = null, maxSessionLength = 300 } = {}) {
    const response = await api.post('/live-parenting/simli-session', {
      face_id: faceId,
      api_key: apiKey,
      max_session_length: maxSessionLength
    });
    return response.data;
  },

  /**
   * Synthesize human-like speech via Cartesia Sonic
   */
  async getCartesiaTTS({ transcript, voiceId = null, apiKey = null, language = 'en' }) {
    const response = await api.post('/live-parenting/cartesia-tts', {
      transcript,
      voice_id: voiceId,
      api_key: apiKey,
      language
    }, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Generate 5-minute session wrap-up and takeaways
   */
  async getSessionSummary({
    childId = null,
    durationSeconds = 300,
    transcript = [],
    guidanceHistory = [],
    mode = 'non_human',
    language = 'en'
  }) {
    const response = await api.post('/live-parenting/summary', {
      child_id: childId ? String(childId) : null,
      duration_seconds: durationSeconds,
      transcript,
      guidance_history: guidanceHistory,
      mode,
      language
    });
    return response.data;
  },

  /**
   * Get LiveKit access token
   */
  async getLiveKitToken(roomName, participantIdentity) {
    const response = await api.post('/live-parenting/livekit-token', {
      room_name: roomName,
      participant_identity: participantIdentity
    });
    return response.data;
  }
};

export default liveParentingService;
