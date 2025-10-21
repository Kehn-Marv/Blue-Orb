import { useTranslation } from '../utils/i18n';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold">Blue Orb</h3>
          <p className="text-gray-400 mt-2">{t('footer.tagline')}</p>
          <p className="text-gray-400 mt-2">
            © {new Date().getFullYear()} Blue Orb. {t('footer.rights')}.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
