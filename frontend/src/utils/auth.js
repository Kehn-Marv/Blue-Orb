export const createAuthHeader = (username, password) => {
  return 'Basic ' + btoa(`${username}:${password}`);
};

export const getStoredAuth = () => {
  return sessionStorage.getItem('adminAuth');
};

export const setStoredAuth = (authHeader) => {
  sessionStorage.setItem('adminAuth', authHeader);
};

export const clearStoredAuth = () => {
  sessionStorage.removeItem('adminAuth');
};

// Note: Admin credentials are now validated server-side
// This function is kept for backward compatibility but should not be used
export const validateAuth = (username, password) => {
  // Always return false to force server-side validation
  return false;
};
