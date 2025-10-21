import { useState } from 'react';
import { useTranslation } from '../../utils/i18n';
import { generateKeypair, saveKeysSecurely, loadProfile, loadSecret, clearKeys, normalizePrivateKey, derivePublicKey, getStoredRoleForPubkey, setStoredRoleForPubkey } from '../../utils/nostr';

const Entry = ({ onLogin, onProfileSetup }) => {
  const [roleTab, setRoleTab] = useState('student');
  const [authMode, setAuthMode] = useState('');
  const [loginSecret, setLoginSecret] = useState('');
  const [profileSetup, setProfileSetup] = useState({ username: '', bio: '' });
  const { t } = useTranslation();

  const handleCreateAccount = async () => {
    try {
      const { nsec, npub } = await generateKeypair();
      const role = roleTab === 'teacher' ? 'teacher' : 'student';
      saveKeysSecurely({ nsec, npub, role, username: '', bio: '' });
      setStoredRoleForPubkey(npub, role);
      setProfileSetup({ username: '', bio: '' });
      onProfileSetup({ nsec, npub, role });
      setAuthMode('');
    } catch (error) {
      console.error('Failed to generate keys:', error);
      alert('Failed to generate keys. Please try again.');
    }
  };

  const handleLogin = async () => {
    if (!loginSecret || loginSecret.length < 10) return;
    try {
      const normalized = await normalizePrivateKey(loginSecret);
      const npub = await derivePublicKey(normalized);
      if (!npub) {
        alert('Invalid private key. Please check and try again.');
        return;
      }
      
      // Enforce role binding for this pubkey
      const storedRole = getStoredRoleForPubkey(npub);
      const requestedRole = roleTab === 'teacher' ? 'teacher' : 'student';
      if (storedRole && storedRole !== requestedRole) {
        alert(`This key is registered as a ${storedRole}. Please select the ${storedRole} tab to log in.`);
        return;
      }
      
      sessionStorage.setItem('nostr_nsec', normalized);
      const existingProfile = loadProfile();
      if (existingProfile) {
        const updated = { ...existingProfile, npub, role: storedRole || requestedRole };
        sessionStorage.setItem('nostr_profile', JSON.stringify(updated));
        onLogin(updated);
      } else {
        sessionStorage.setItem('nostr_profile', JSON.stringify({ npub, role: (storedRole || requestedRole), username: '', bio: '' }));
        if (!storedRole) setStoredRoleForPubkey(npub, requestedRole);
        onLogin({ npub, role: (storedRole || requestedRole), username: '', bio: '' });
      }
      setAuthMode('');
      setLoginSecret('');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Failed to login. Please check your private key.');
    }
  };

  const handleProfileSetup = () => {
    if (!profileSetup.username.trim()) {
      alert('Please enter a username');
      return;
    }
    onProfileSetup({ ...profileSetup, complete: true });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('community.title')}</h1>
        <p className="text-xl text-gray-600">{t('community.description')}</p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Join the Community
          </h2>
          
          <div className="flex items-center justify-center space-x-3 mb-6">
            <button
              type="button"
              aria-pressed={roleTab==='student'}
              onClick={()=>setRoleTab('student')}
              className={`px-6 py-3 rounded-full font-medium transition-all focus:outline-none
                ${roleTab==='student' ? 'bg-blue-600 text-white shadow-md scale-105' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              Student
            </button>
            <button
              type="button"
              aria-pressed={roleTab==='teacher'}
              onClick={()=>setRoleTab('teacher')}
              className={`px-6 py-3 rounded-full font-medium transition-all focus:outline-none
                ${roleTab==='teacher' ? 'bg-blue-600 text-white shadow-md scale-105' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              Teacher
            </button>
          </div>

          {authMode === 'create' ? (
            <div className="space-y-4">
              <p className="text-gray-700 text-center">
                Generate a new Nostr keypair for your {roleTab} profile. Keep your private key safe.
              </p>
              <button onClick={handleCreateAccount} className="btn-primary w-full">
                Generate Keys & Create Account
              </button>
              <button onClick={()=>setAuthMode('')} className="btn-secondary w-full">
                Back
              </button>
            </div>
          ) : authMode === 'login' ? (
            <div className="space-y-4">
              <input 
                type="password" 
                value={loginSecret} 
                onChange={(e)=>setLoginSecret(e.target.value)} 
                className="input-field" 
                placeholder="Paste your nsec (private key)" 
              />
              <button onClick={handleLogin} className="btn-primary w-full">Log in</button>
              <button onClick={()=>setAuthMode('')} className="btn-secondary w-full">Back</button>
            </div>
          ) : (
            <div className="space-y-4">
              <button onClick={()=>setAuthMode('create')} className="btn-primary w-full">
                Create Account
              </button>
              <button onClick={()=>setAuthMode('login')} className="btn-secondary w-full">
                Log in with existing key
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Entry;
