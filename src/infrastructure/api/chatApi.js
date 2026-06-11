import api from './apiClient';

export const chatApi = {
  /**
   * Fetches conversation history between a specific user and guide
   */
  async fetchHistory(userId, guideId) {
    try {
      const response = await api.get('/api/v1/chat/history', {
        params: {
          user_id: userId,
          guide_id: guideId,
        },
      });

      // Handle structural matching depending on if data returns raw or wrapped inside data object
      const payload = response?.data?.data ?? response?.data ?? {};
      return {
        messages: payload.messages || [],
        is_online: payload.is_online || false
      };
    } catch (error) {
      console.error('Failed to fetch chat history via apiClient:', error);
      throw error;
    }
  }
};