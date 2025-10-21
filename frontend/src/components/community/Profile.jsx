import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { loadSecret, updateProfile } from '../../utils/nostr';

const Profile = ({ profile, onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    bio: profile?.bio || ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const { post } = useApi();

  useEffect(() => {
    setFormData({
      username: profile?.username || '',
      bio: profile?.bio || ''
    });
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      alert('Please enter a username.');
      return;
    }

    try {
      setSubmitting(true);
      
      // Update local profile
      const updatedProfile = updateProfile({
        username: formData.username,
        bio: formData.bio
      });
      
      // Sync with backend
      await post('/community/profile/sync', {
        npub: profile.npub,
        username: formData.username,
        bio: formData.bio,
        role: profile.role
      });
      
      if (onProfileUpdate) {
        onProfileUpdate(updatedProfile);
      }
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Username *
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            className="input-field"
            placeholder="Enter your username"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            className="input-field min-h-[80px]"
            placeholder="Tell us about yourself"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Role
          </label>
          <input
            type="text"
            value={profile?.role || 'student'}
            className="input-field"
            disabled
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full disabled:opacity-50"
        >
          {submitting ? 'Updating...' : 'Update Profile'}
        </button>
      </form>

      {/* Keys Section */}
      <div className="mt-8 pt-6 border-t">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Keys</h3>
          <button
            onClick={() => setShowKeys(!showKeys)}
            className="btn-secondary"
          >
            {showKeys ? 'Hide' : 'Show'} Keys
          </button>
        </div>

        {showKeys && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Public Key (npub)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  value={profile?.npub || 'n/a'}
                  readOnly
                  className="input-field flex-1 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(profile?.npub || '')}
                  className="btn-secondary"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Private Key (nsec) - Keep Secret!
              </label>
              <div className="flex items-center space-x-2">
                <input
                  value={maskNsec(loadSecret()) || 'n/a'}
                  readOnly
                  className="input-field flex-1 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(loadSecret() || '')}
                  className="btn-secondary"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
