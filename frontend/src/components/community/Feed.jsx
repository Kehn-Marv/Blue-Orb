import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { useTranslation } from '../../utils/i18n';
import { extractTitle, renderMarkdown } from '../../utils/markdown';
import LoadingSpinner from '../LoadingSpinner';

const Feed = ({ profile, subjectFilter, onQuestionSelect, onClearFilter }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { get } = useApi();
  const { t } = useTranslation();

  const loadFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (subjectFilter) params.set('subject', subjectFilter);
      // Only filter by role for students - teachers should see all questions
      if (profile?.role === 'student') params.set('role', profile.role);
      
      const response = await get(`/community/feed?${params.toString()}`);
      setQuestions(response || []);
    } catch (err) {
      console.error('Failed to load feed:', err);
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [subjectFilter, profile?.role]);

  if (loading) {
    return <div className="max-w-3xl mx-auto"><LoadingSpinner message="Loading questions..." /></div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={loadFeed} className="btn-primary">Retry</button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 max-w-3xl mx-auto">
        <p className="text-gray-600">
          {subjectFilter 
            ? `No questions found for ${subjectFilter}. Try selecting a different subject or clear the filter to see all questions.`
            : 'No questions found.'
          }
        </p>
        {subjectFilter && (
          <button 
            onClick={onClearFilter} 
            className="btn-secondary mt-4"
          >
            Clear Filter
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {questions.map((question) => {
        const subjectTag = question.tags?.find(t => t[0] === 'subject');
        const roleTag = question.tags?.find(t => t[0] === 'role');
        const authorTag = question.tags?.find(t => t[0] === 'p');
        const { title, content } = extractTitle(question.content);
        
        return (
          <div 
            key={question.id} 
            className="card cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onQuestionSelect(question)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">Question</h3>
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
              <div className="text-lg font-bold text-gray-900 mb-2">
                <span dangerouslySetInnerHTML={renderMarkdown(title)} />
              </div>
            )}
            
            <div className="text-gray-700 mb-3">
              {content.length > 200 
                ? `${content.substring(0, 200)}...` 
                : content
              }
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Author: {authorTag ? `${authorTag[1].slice(0, 10)}...` : 'Unknown'}</span>
              <span>Click to view thread</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Feed;
