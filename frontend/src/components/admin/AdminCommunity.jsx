import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../LoadingSpinner';

const AdminCommunity = () => {
  const [stats, setStats] = useState(null);
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const { get, post, del } = useApi();

  const loadStats = async () => {
    try {
      const response = await get('/admin/community/stats');
      setStats(response);
    } catch (error) {
      console.error('Failed to load community stats:', error);
    }
  };

  const loadFlaggedContent = async () => {
    try {
      const response = await get('/admin/community/flagged');
      setFlaggedContent(response || []);
    } catch (error) {
      console.error('Failed to load flagged content:', error);
    }
  };

  const handleFlagContent = async (eventId, reason) => {
    try {
      await post(`/admin/community/flag/${eventId}`, { reason });
      await loadFlaggedContent();
      alert('Content flagged successfully');
    } catch (error) {
      console.error('Failed to flag content:', error);
      alert('Failed to flag content');
    }
  };

  const handleUnflagContent = async (eventId) => {
    try {
      await post(`/admin/community/unflag/${eventId}`);
      await loadFlaggedContent();
      alert('Content unflagged successfully');
    } catch (error) {
      console.error('Failed to unflag content:', error);
      alert('Failed to unflag content');
    }
  };

  const handleDeleteContent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return;
    }

    try {
      await del(`/admin/community/${eventId}`);
      await loadFlaggedContent();
      await loadStats();
      alert('Content deleted successfully');
    } catch (error) {
      console.error('Failed to delete content:', error);
      alert('Failed to delete content');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadStats(), loadFlaggedContent()]);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading community moderation data..." />;
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Community Statistics</h2>
        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900">Total Questions</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalQuestions}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900">Total Replies</h3>
              <p className="text-3xl font-bold text-green-600">{stats.totalReplies}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900">Active Users</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.activeUsers}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">No statistics available</p>
        )}
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Flagged Content</h2>
        {flaggedContent.length === 0 ? (
          <p className="text-gray-600">No flagged content found</p>
        ) : (
          <div className="space-y-4">
            {flaggedContent.map((item) => (
              <div key={item.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Flagged Content</h3>
                  <span className="text-sm text-gray-500">
                    {new Date((item.created_at || Date.now()) * 1000).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{item.content}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Reason: {item.flagReason}</span>
                  <button
                    onClick={() => handleUnflagContent(item.id)}
                    className="btn-secondary text-xs"
                  >
                    Unflag
                  </button>
                  <button
                    onClick={() => handleDeleteContent(item.id)}
                    className="btn-secondary text-xs bg-red-100 text-red-600 hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Moderation Actions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Content Moderation</h3>
            <p className="text-gray-600 text-sm mb-3">
              The system automatically moderates content for spam and inappropriate material.
              Flagged content appears above for manual review.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Rate Limiting</h3>
            <p className="text-gray-600 text-sm mb-3">
              Rate limiting is applied to prevent spam and abuse:
            </p>
            <ul className="text-gray-600 text-sm list-disc list-inside space-y-1">
              <li>Community requests: 100 per 15 minutes</li>
              <li>Posting: 10 per 5 minutes</li>
              <li>Key generation: 5 per minute</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCommunity;
