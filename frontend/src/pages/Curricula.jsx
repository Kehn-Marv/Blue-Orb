import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useTranslation } from '../utils/i18n';
import LoadingSpinner from '../components/LoadingSpinner';

const Curricula = () => {
  const [curricula, setCurricula] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const { get } = useApi();
  const { t } = useTranslation();

  useEffect(() => {
    loadCurricula();
  }, []);

  const loadCurricula = async () => {
    try {
      setLoading(true);
      const data = await get('/curricula');
      setCurricula(data);
    } catch (error) {
      console.error('Failed to load curricula:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIPFSUrl = (cid) => {
    return cid ? `https://dweb.link/ipfs/${cid}` : null;
  };

  if (loading) {
    return <LoadingSpinner message={t('curricula.loading')} />;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('curricula.title')}
        </h1>
        <p className="text-xl text-gray-600">
          {t('curricula.description')}
        </p>
      </div>

      {curricula.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">{t('curricula.empty')}</p>
        </div>
      ) : (
        <div className="grid-responsive">
          {curricula.map((item) => (
            <div
              key={item.id}
              className="material-card card-interactive"
              onClick={() => setSelectedItem(item)}
            >
              {item.thumbnailCID && (
                <div className="relative overflow-hidden">
                  <img
                    src={getIPFSUrl(item.thumbnailCID)}
                    alt={item.title}
                    className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              )}
              
              <div className="material-card-content">
                <h3 className="card-title">
                  {item.title}
                </h3>
                
                <p className="card-description line-clamp-3">
                  {item.description}
                </p>
                
                <div className="flex items-center justify-between mt-4">
                  {item.subject && (
                    <span className="badge badge-primary">
                      {item.subject}
                    </span>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    Click to view details
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem.thumbnailCID && (
              <img
                src={getIPFSUrl(selectedItem.thumbnailCID)}
                alt={selectedItem.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {selectedItem.title}
            </h2>
            {selectedItem.subject && (
              <p className="text-primary font-medium mb-4">
                {t('form.subject')}: {selectedItem.subject}
              </p>
            )}
            <p className="text-gray-700 mb-6 whitespace-pre-wrap">
              {selectedItem.description}
            </p>
            <div className="flex gap-4 justify-center">
              {selectedItem.fileCID && (
                <a
                  href={getIPFSUrl(selectedItem.fileCID)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-download focus-ring flex-1 text-center"
                >
                  <span>Download</span>
                </a>
              )}
              <button
                onClick={() => setSelectedItem(null)}
                className="btn-secondary flex-1 text-center"
              >
                {t('admin.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Curricula;
