import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { loadSecret } from '../../utils/nostr';
import { SUBJECT_OPTIONS } from '../../utils/nostr';

const AskQuestion = ({ profile, onQuestionPosted }) => {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    content: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const { post } = useApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      alert('Please enter your question.');
      return;
    }

    const nsec = loadSecret();
    if (!nsec) {
      alert('Please log in first.');
      return;
    }

    try {
      setSubmitting(true);
      
      console.log('Submitting question:', {
        nsec: nsec ? 'present' : 'missing',
        title: formData.title,
        subject: formData.subject,
        content: formData.content,
        role: profile?.role || 'student'
      });
      
      await post('/community/questions', {
        nsec,
        title: formData.title,
        subject: formData.subject,
        content: formData.content,
        role: profile?.role || 'student'
      });

      // Reset form
      setFormData({ title: '', subject: '', content: '' });
      
      if (onQuestionPosted) {
        onQuestionPosted();
      }
      
      alert('Question posted successfully!');
    } catch (error) {
      console.error('Failed to post question:', error);
      alert('Failed to post question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Ask a Question</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Title (optional)
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="input-field"
            placeholder="Brief title for your question"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Subject
          </label>
          <select
            value={formData.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            className="input-field"
          >
            <option value="">Select a subject</option>
            {SUBJECT_OPTIONS.map(subject => (
              <option key={subject} value={subject.toLowerCase()}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Question *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            className="input-field min-h-[120px]"
            placeholder="Describe your question in detail..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full disabled:opacity-50"
        >
          {submitting ? 'Posting...' : 'Post Question'}
        </button>
      </form>
    </div>
  );
};

export default AskQuestion;
