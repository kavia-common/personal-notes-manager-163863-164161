export const getURL = () => {
  let url = process.env.REACT_APP_SITE_URL || 'http://localhost:3000';

  if (!url.startsWith('http')) {
    url = `https://${url}`;
  }
  if (!url.endsWith('/')) {
    url = `${url}/`;
  }
  return url;
};

// Basic auth error handler for future extension
export const handleAuthError = (error, routerPush = () => {}) => {
  // eslint-disable-next-line no-console
  console.error('Authentication error:', error);
  const message = (error?.message || '').toLowerCase();
  if (message.includes('redirect')) {
    routerPush('/auth/error?type=redirect');
  } else if (message.includes('email')) {
    routerPush('/auth/error?type=email');
  } else {
    routerPush('/auth/error');
  }
};
