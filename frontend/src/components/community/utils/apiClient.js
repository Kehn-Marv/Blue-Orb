// API client utilities for community features
import { useApi } from '../../../hooks/useApi';

// Community API functions
export const useCommunityApi = () => {
  const { get, post } = useApi();

  return {
    // Questions
    postQuestion: async (data) => {
      return await post('/community/questions', data);
    },
    
    getQuestions: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return await get(`/community/questions?${queryString}`);
    },
    
    cacheQuestion: async (event, signature) => {
      return await post('/community/questions/cache', { event, signature });
    },

    // Replies
    postReply: async (data) => {
      return await post('/community/replies', data);
    },
    
    getReplies: async (parentId) => {
      return await get(`/community/replies?parentId=${parentId}`);
    },
    
    getRepliesByAuthor: async (author) => {
      return await get(`/community/replies-by-author?author=${author}`);
    },
    
    cacheReply: async (event, signature) => {
      return await post('/community/replies/cache', { event, signature });
    },

    // Feed
    getFeed: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return await get(`/community/feed?${queryString}`);
    },

    // Profile
    syncProfile: async (data) => {
      return await post('/community/profile/sync', data);
    },

    // Utility
    deleteEvent: async (eventId, nsec) => {
      return await post('/community/delete', { eventId, nsec });
    },
    
    clearAllData: async (nsec) => {
      return await post('/community/clear-all', { nsec });
    },
    
    generateKeys: async () => {
      return await get('/community/keys');
    }
  };
};

// Helper functions for API calls
export const communityApi = {
  // Post a question with automatic caching
  async postQuestionWithCache(nsec, title, subject, content, role = 'student') {
    const { post } = useApi();
    
    // First publish to Nostr
    const result = await post('/community/questions', {
      nsec, title, subject, content, role
    });
    
    // Then cache it
    if (result?.ok) {
      try {
        await post('/community/questions/cache', {
          event: result.data,
          signature: result.data.sig
        });
      } catch (e) {
        console.warn('Failed to cache question:', e);
      }
    }
    
    return result;
  },

  // Post a reply with automatic caching
  async postReplyWithCache(nsec, content, parentId, role = 'teacher') {
    const { post } = useApi();
    
    // First publish to Nostr
    const result = await post('/community/replies', {
      nsec, content, parentId, role
    });
    
    // Then cache it
    if (result?.ok) {
      try {
        await post('/community/replies/cache', {
          event: result.data,
          signature: result.data.sig
        });
      } catch (e) {
        console.warn('Failed to cache reply:', e);
      }
    }
    
    return result;
  },

  // Sync profile with backend
  async syncProfileWithBackend(npub, username, bio, role) {
    const { post } = useApi();
    
    return await post('/community/profile/sync', {
      npub, username, bio, role
    });
  }
};
