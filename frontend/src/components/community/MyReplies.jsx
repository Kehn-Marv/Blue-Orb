import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { loadProfile, loadSecret } from '../../utils/nostr';
import LoadingSpinner from '../LoadingSpinner';

const MyReplies = () => {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReply, setEditingReply] = useState(null);
  const [editContent, setEditContent] = useState('');
  const { get, post } = useApi();
  const profile = loadProfile();

  const loadReplies = async () => {
    if (!profile?.npub) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await get(`/community/replies-by-author?author=${profile.npub}`);
      setReplies(response || []);
    } catch (err) {
      console.error('Failed to load replies:', err);
      setError('Failed to load replies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReplies();
  }, [profile?.npub]);

  const handleEdit = (reply) => {
    setEditingReply(reply);
    setEditContent(reply.content);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      alert('Please enter content for your reply.');
      return;
    }

    const nsec = loadSecret();
    if (!nsec) {
      alert('Please log in first.');
      return;
    }

    try {
      await post('/community/replies/edit', {
        nsec,
        replyId: editingReply.id,
        content: editContent
      });

      setEditingReply(null);
      setEditContent('');
      loadReplies(); // Reload replies
      alert('Reply updated successfully!');
    } catch (error) {
      console.error('Failed to edit reply:', error);
      alert('Failed to edit reply. Please try again.');
    }
  };

  const handleDelete = async (replyId) => {
    if (!confirm('Are you sure you want to delete this reply? This action cannot be undone.')) {
      return;
    }

    const nsec = loadSecret();
    if (!nsec) {
      alert('Please log in first.');
      return;
    }

    try {
      await post('/community/replies/delete', {
        nsec,
        eventId: replyId
      });

      loadReplies(); // Reload replies
      alert('Reply deleted successfully!');
    } catch (error) {
      console.error('Failed to delete reply:', error);
      alert('Failed to delete reply. Please try again.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your replies..." />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={loadReplies} className="btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Replies</h2>
        <span className="text-sm text-gray-500">{replies.length} replies</span>
      </div>

      {replies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">You haven't made any replies yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {replies.map((reply) => {
            const replyRoleTag = reply.tags?.find(t => t[0] === 'role');
            const parentTag = reply.tags?.find(t => t[0] === 'e');
            const isEditing = editingReply?.id === reply.id;
            
            return (
              <div key={reply.id} className="card bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">Reply</span>
                    {replyRoleTag && (
                      <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                        {replyRoleTag[1]}
                      </span>
                    )}
                    {reply.tags?.find(t => t[0] === 't' && t[1] === 'edit') && (
                      <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                        Edited
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {new Date((reply.created_at || Date.now()) * 1000).toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleEdit(reply)}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(reply.id)}
                      className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="input-field min-h-[100px]"
                      placeholder="Edit your reply..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="btn-primary text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingReply(null);
                          setEditContent('');
                        }}
                        className="btn-secondary text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-700 whitespace-pre-wrap mb-2">
                    {reply.content}
                  </div>
                )}
                
                <div className="text-sm text-gray-500">
                  {parentTag && (
                    <span>Reply to: {parentTag[1].slice(0, 10)}...</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyReplies;
