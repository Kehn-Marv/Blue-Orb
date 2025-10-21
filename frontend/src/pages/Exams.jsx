import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useTranslation } from '../utils/i18n';
import LoadingSpinner from '../components/LoadingSpinner';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();
  const { t } = useTranslation();

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await get('/exams');
      setExams(data);
    } catch (error) {
      console.error('Failed to load exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIPFSUrl = (cid) => {
    return cid ? `https://dweb.link/ipfs/${cid}` : null;
  };

  if (loading) {
    return <LoadingSpinner message={t('exams.loading')} />;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('exams.title')}
        </h1>
        <p className="text-xl text-gray-600">
          {t('exams.description')}
        </p>
      </div>

      {exams.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">{t('exams.empty')}</p>
        </div>
      ) : (
        <div className="grid-responsive">
          {exams.map((exam) => (
            <div key={exam.id} className="exam-card card-elevated card-interactive">
              <div className="exam-card-content">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="exam-title">
                      {exam.title}
                    </h3>
                    {exam.subject && (
                      <p className="exam-subject">
                        {exam.subject}
                      </p>
                    )}
                  </div>
                  {exam.year && (
                    <span className="badge badge-accent exam-year">
                      {exam.year}
                    </span>
                  )}
                </div>

                <div className="exam-actions">
                  {exam.fileCID && (
                    <a
                      href={getIPFSUrl(exam.fileCID)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-download focus-ring"
                    >
                      <span>{t('exams.download')}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Exams;
