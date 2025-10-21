import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useTranslation } from '../utils/i18n';
import LoadingSpinner from '../components/LoadingSpinner';

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();
  const { t } = useTranslation();

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await get('/materials');
      setMaterials(data);
    } catch (error) {
      console.error('Failed to load materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIPFSUrl = (cid) => {
    return cid ? `https://dweb.link/ipfs/${cid}` : null;
  };

  if (loading) {
    return <LoadingSpinner message={t('materials.loading')} />;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('materials.title')}
        </h1>
        <p className="text-xl text-gray-600">
          {t('materials.description')}
        </p>
      </div>

      {materials.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">{t('materials.empty')}</p>
        </div>
      ) : (
        <div className="grid-responsive">
          {materials.map((material) => (
            <div key={material.id} className="material-card card-interactive">
              {material.thumbnailCID && (
                <div className="relative overflow-hidden">
                  <img
                    src={getIPFSUrl(material.thumbnailCID)}
                    alt={material.title}
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
                  {material.title}
                </h3>

                {material.author && (
                  <p className="card-subtitle">
                    {t('materials.author')}: {material.author}
                  </p>
                )}

                <p className="card-description line-clamp-3">
                  {material.description}
                </p>

                <div className="flex items-center justify-between mt-4">
                  {material.category && (
                    <span className="badge badge-warm">
                      {material.category}
                    </span>
                  )}

                  {material.fileCID && (
                    <a
                      href={getIPFSUrl(material.fileCID)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-download focus-ring"
                    >
                      <span>Download</span>
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

export default Materials;
