import { useState, useEffect } from 'react';
import { useTranslation } from '../utils/i18n';
import { loadProfile, loadSecret, clearKeys } from '../utils/nostr';
import Entry from '../components/community/Entry';
import Feed from '../components/community/Feed';
import AskQuestion from '../components/community/AskQuestion';
import ThreadView from '../components/community/ThreadView';
import Profile from '../components/community/Profile';
import Settings from '../components/community/Settings';
import MyReplies from '../components/community/MyReplies';

const Community = () => {
  const [profile, setProfile] = useState(null);
  const [currentView, setCurrentView] = useState('feed');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { t } = useTranslation();

  // Load profile on mount
  useEffect(() => {
    const savedProfile = loadProfile();
    if (savedProfile) {
      setProfile(savedProfile);
      // Set initial view based on role
      if (savedProfile.role === 'teacher') {
        setCurrentView('feed');
      } else {
        setCurrentView('ask');
      }
    }
  }, []);

  // Handle login
  const handleLogin = (userProfile) => {
    setProfile(userProfile);
    setShowProfileSetup(false);
    // Set initial view based on role
    if (userProfile.role === 'teacher') {
      setCurrentView('feed');
    } else {
      setCurrentView('ask');
    }
  };

  // Handle profile setup
  const handleProfileSetup = (profileData) => {
    if (profileData.complete) {
      setProfile(prev => ({ ...prev, ...profileData }));
      setShowProfileSetup(false);
    } else {
      setProfile(profileData);
      setShowProfileSetup(true);
    }
  };

  // Handle logout
  const handleLogout = () => {
    clearKeys();
    setProfile(null);
    setCurrentView('feed');
    setSelectedQuestion(null);
  };

  // Handle profile update
  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  // Handle question posted
  const handleQuestionPosted = () => {
    setCurrentView('feed');
    setSelectedQuestion(null);
  };

  // Handle reply posted
  const handleReplyPosted = () => {
    // Refresh the thread view
    setSelectedQuestion(prev => prev ? { ...prev } : null);
  };

  // Handle question selection
  const handleQuestionSelect = (question) => {
    setSelectedQuestion(question);
    if (question) {
      setCurrentView('thread');
    } else {
      setCurrentView('feed');
    }
  };

  // Handle subject filter clearing
  const handleClearSubjectFilter = () => {
    setSubjectFilter('');
  };

  // Show profile setup if needed
  if (showProfileSetup) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Complete Your Profile
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Username *</label>
                <input 
                  value={profile?.username || ''} 
                  onChange={e => setProfile(prev => ({ ...prev, username: e.target.value }))} 
                  className="input-field" 
                  placeholder="Enter your username" 
                  required 
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Bio</label>
                <textarea 
                  value={profile?.bio || ''} 
                  onChange={e => setProfile(prev => ({ ...prev, bio: e.target.value }))} 
                  className="input-field min-h-[80px]" 
                  placeholder="Tell us about yourself" 
                />
              </div>
              <button 
                onClick={() => handleProfileSetup({ complete: true })} 
                className="btn-primary w-full"
              >
                Complete Setup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show entry screen if not logged in
  if (!profile) {
    return <Entry onLogin={handleLogin} onProfileSetup={handleProfileSetup} />;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-bold text-gray-900">{t('community.title')}</h1>
          <p className="text-xl text-gray-600">{t('community.description')}</p>
        </div>
        
        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-3">
          <span className="text-sm text-gray-600">
            {profile.role?.toUpperCase()} · {profile.npub ? profile.npub.slice(0,10)+'…' : 'npub not set'}
          </span>
          <button 
            onClick={() => setCurrentView('profile')} 
            className="btn-secondary"
          >
            Profile
          </button>
          <button 
            onClick={() => setCurrentView('settings')} 
            className="btn-secondary"
          >
            Settings
          </button>
        </div>

        {/* Mobile hamburger menu */}
        <div className="md:hidden relative">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {showMobileMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
              <div className="py-2">
                <button
                  onClick={() => {
                    setCurrentView('profile');
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    setCurrentView('settings');
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {profile.role === 'student' && (
          <>
            <button 
              onClick={() => {
                setCurrentView('ask');
                setSelectedQuestion(null);
              }} 
              className={`px-4 py-2 rounded ${currentView === 'ask' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              Ask Question
            </button>
            <button 
              onClick={() => {
                setCurrentView('feed');
                setSelectedQuestion(null);
              }} 
              className={`px-4 py-2 rounded ${currentView === 'feed' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              Browse Questions
            </button>
          </>
        )}
        {profile.role === 'teacher' && (
          <>
            <button 
              onClick={() => {
                setCurrentView('feed');
                setSelectedQuestion(null);
              }} 
              className={`px-4 py-2 rounded ${currentView === 'feed' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              Browse Questions
            </button>
            <button 
              onClick={() => {
                setCurrentView('my-replies');
                setSelectedQuestion(null);
              }} 
              className={`px-4 py-2 rounded ${currentView === 'my-replies' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              My Replies
            </button>
          </>
        )}
      </div>

      {/* Subject Filter */}
      {currentView === 'feed' && (
        <div className="mb-6">
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="">All Subjects</option>
            <option value="math">Math</option>
            <option value="science">Science</option>
            <option value="english">English</option>
            <option value="biology">Biology</option>
            <option value="chemistry">Chemistry</option>
            <option value="physics">Physics</option>
            <option value="history">History</option>
            <option value="geography">Geography</option>
          </select>
        </div>
      )}

      {/* Main Content */}
      {currentView === 'thread' ? (
        // Standalone thread view - center on the page
        <div className="max-w-3xl mx-auto">
          {selectedQuestion && (
            <ThreadView 
              question={selectedQuestion} 
              profile={profile} 
              onReplyPosted={handleReplyPosted}
            />
          )}
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          {currentView === 'ask' && (
            <AskQuestion 
              profile={profile} 
              onQuestionPosted={handleQuestionPosted}
            />
          )}
          
          {currentView === 'feed' && (
            <Feed 
              profile={profile} 
              subjectFilter={subjectFilter}
              onQuestionSelect={handleQuestionSelect}
              onClearFilter={handleClearSubjectFilter}
            />
          )}
          
          {currentView === 'my-replies' && (
            <MyReplies />
          )}
          
          {currentView === 'profile' && (
            <Profile 
              profile={profile} 
              onProfileUpdate={handleProfileUpdate}
            />
          )}
          
          {currentView === 'settings' && (
            <Settings 
              profile={profile} 
              onLogout={handleLogout}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Community;