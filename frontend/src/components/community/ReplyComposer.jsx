import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { loadSecret } from '../../utils/nostr';

const ReplyComposer = ({ question, profile, onReplyPosted, parentReply = null }) => {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { post } = useApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('Please enter your reply.');
      return;
    }

    const nsec = loadSecret();
    if (!nsec) {
      alert('Please log in first.');
      return;
    }

    try {
      setSubmitting(true);
      
      // Determine the parent ID - if replying to a reply, use the reply's ID, otherwise use the question's ID
      const parentId = parentReply ? parentReply.id : question.id;
      
      await post('/community/replies', {
        nsec,
        content,
        parentId,
        role: profile?.role || 'student'
      });

      // Reset form
      setContent('');
      
      if (onReplyPosted) {
        onReplyPosted();
      }
      
      alert('Reply posted successfully!');
    } catch (error) {
      console.error('Failed to post reply:', error);
      alert('Failed to post reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {parentReply ? 'Reply to Reply' : 'Reply to Question'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Your Reply
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input-field min-h-[120px]"
            placeholder="Write your reply to help the student..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full disabled:opacity-50"
        >
          {submitting ? 'Posting...' : 'Post Reply'}
        </button>
      </form>
    </div>
  );
};

export default ReplyComposer;
