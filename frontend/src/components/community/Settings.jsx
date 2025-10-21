import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { loadSecret, clearKeys } from '../../utils/nostr';

const Settings = ({ profile, onLogout }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { post } = useApi();

  const handleLogout = () => {
    clearKeys();
    if (onLogout) {
      onLogout();
    }
  };

  const handleClearAllData = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    const nsec = loadSecret();
    if (!nsec) {
      alert('Please log in first.');
      return;
    }

    if (!window.confirm('This will delete ALL your questions and replies. This action cannot be undone. Are you sure?')) {
      setShowDeleteConfirm(false);
      return;
    }

    try {
      setDeleting(true);
      
      await post('/community/clear-all', { nsec });
      
      alert('All data cleared successfully!');
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to clear data:', error);
      alert('Failed to clear data. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
        return;
      }
      
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          alert('Copied to clipboard!');
        } else {
          throw new Error('Copy command failed');
        }
      } catch (err) {
        console.error('Fallback copy failed:', err);
        alert('Failed to copy to clipboard. Please copy manually.');
      } finally {
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      alert('Failed to copy to clipboard. Please copy manually.');
    }
  };

  const maskNsec = (nsec) => {
    if (!nsec) return '';
    const str = String(nsec);
    return str.slice(0, 6) + '...' + str.slice(-6);
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
      
      <div className="space-y-6">
        {/* Profile Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Information</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Username</label>
              <div className="text-gray-600">{profile?.username || 'Not set'}</div>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Role</label>
              <div className="text-gray-600 capitalize">{profile?.role || 'student'}</div>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Public Key</label>
              <div className="flex items-center space-x-2">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1">
                  {profile?.npub ? `${profile.npub.slice(0, 20)}...` : 'Not available'}
                </code>
                <button
                  onClick={() => copyToClipboard(profile?.npub || '')}
                  className="btn-secondary text-xs"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Keys Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Keys</h3>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Private Key (nsec) - Keep Secret!
            </label>
            <div className="flex items-center space-x-2">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1">
                {maskNsec(loadSecret()) || 'Not available'}
              </code>
              <button
                onClick={() => copyToClipboard(loadSecret() || '')}
                className="btn-secondary text-xs"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-6 border-t border-red-200">
          <h3 className="text-lg font-semibold text-red-600 mb-3">Danger Zone</h3>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Clear All Data</h4>
              <p className="text-sm text-gray-600 mb-3">
                This will delete all your questions and replies from the community. This action cannot be undone.
              </p>
              <button
                onClick={handleClearAllData}
                disabled={deleting}
                className={`btn-secondary ${showDeleteConfirm ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-100 text-red-600 hover:bg-red-200'} disabled:opacity-50`}
              >
                {deleting ? 'Deleting...' : showDeleteConfirm ? 'Confirm Delete All Data' : 'Clear All Data'}
              </button>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Logout</h4>
              <p className="text-sm text-gray-600 mb-3">
                Logout from your account. You can log back in with your private key.
              </p>
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
