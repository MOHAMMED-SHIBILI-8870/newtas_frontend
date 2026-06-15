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
  },

  /**
   * Fetches the list of contacts (user IDs) the current user has chatted with
   */
  async fetchContacts() {
    try {
      const response = await api.get('/api/v1/chat/contacts');
      return response?.data?.contacts || [];
    } catch (error) {
      console.error('Failed to fetch chat contacts:', error);
      throw error;
    }
  },

  /**
   * Fetches the dynamic ID of the Customer Support agent
   */
  async fetchSupportAgentId() {
    try {
      const response = await api.get('/api/v1/chat/support-agent');
      return response?.data?.id || '4';
    } catch (error) {
      console.error('Failed to fetch support agent ID:', error);
      return '4';
    }
  }
};