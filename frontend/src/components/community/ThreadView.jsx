import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { extractTitle, renderMarkdown } from '../../utils/markdown';
import { loadSecret } from '../../utils/nostr';
import LoadingSpinner from '../LoadingSpinner';
import ReplyComposer from './ReplyComposer';

const ThreadView = ({ question, profile, onReplyPosted }) => {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null); // Track which reply we're replying to
  const [editingReply, setEditingReply] = useState(null); // Track which reply we're editing
  const [editContent, setEditContent] = useState('');
  const { get, post } = useApi();

  const loadReplies = async () => {
    if (!question?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await get(`/community/replies?parentId=${question.id}`);
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
  }, [question?.id]);

  const handleReplyPosted = () => {
    loadReplies();
    setReplyingTo(null); // Clear the replying state
    if (onReplyPosted) {
      onReplyPosted();
    }
  };

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

  if (!question) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Select a question to view the thread.</p>
      </div>
    );
  }

  const subjectTag = question.tags?.find(t => t[0] === 'subject');
  const roleTag = question.tags?.find(t => t[0] === 'role');
  const authorTag = question.tags?.find(t => t[0] === 'p');
  const { title, content } = extractTitle(question.content);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Question */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">Question</h2>
            {roleTag && (
              <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                {roleTag[1]}
              </span>
            )}
            {subjectTag && (
              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">
                {subjectTag[1]}
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500">
            {new Date((question.created_at || Date.now()) * 1000).toLocaleString()}
          </span>
        </div>
        
        {title && (
          <div className="text-xl font-bold text-gray-900 mb-4">
            <span dangerouslySetInnerHTML={renderMarkdown(title)} />
          </div>
        )}
        
        <div className="text-gray-700 whitespace-pre-wrap mb-4">
          {content}
        </div>
        
        <div className="text-sm text-gray-500">
          Author: {authorTag ? `${authorTag[1].slice(0, 10)}...` : 'Unknown'}
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Replies ({replies.length})
        </h3>
        
        {loading ? (
          <LoadingSpinner message="Loading replies..." />
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={loadReplies} className="btn-primary">Retry</button>
          </div>
        ) : replies.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No replies yet.</p>
          </div>
        ) : (
          replies.map((reply) => {
            const replyRoleTag = reply.tags?.find(t => t[0] === 'role');
            const replyAuthorTag = reply.tags?.find(t => t[0] === 'p');
            const isReplyingToThis = replyingTo === reply.id;
            const isEditingThis = editingReply?.id === reply.id;
            const isEdited = reply.tags?.find(t => t[0] === 't' && t[1] === 'edit');
            const isOwnReply = profile?.npub && replyAuthorTag && replyAuthorTag[1] === profile.npub;
            
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
                    {isEdited && (
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
                      onClick={() => setReplyingTo(isReplyingToThis ? null : reply.id)}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    >
                      {isReplyingToThis ? 'Cancel' : 'Reply'}
                    </button>
                    {isOwnReply && (
                      <>
                        <button
                          onClick={() => handleEdit(reply)}
                          className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(reply.id)}
                          className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                {isEditingThis ? (
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
                  Author: {replyAuthorTag ? `${replyAuthorTag[1].slice(0, 10)}...` : 'Unknown'}
                </div>
                
                {/* Reply composer for this specific reply */}
                {isReplyingToThis && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <ReplyComposer 
                      question={question} 
                      profile={profile} 
                      onReplyPosted={handleReplyPosted}
                      parentReply={reply}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Reply Composer for main question */}
      <ReplyComposer 
        question={question} 
        profile={profile} 
        onReplyPosted={handleReplyPosted}
      />
    </div>
  );
};

export default ThreadView;
