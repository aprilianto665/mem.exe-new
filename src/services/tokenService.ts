const TOKEN_COOKIE_NAME = 'auth_token';

const getIsSecureEnvironment = () =>
  typeof window !== 'undefined' && window.location.protocol === 'https:';

export const setAuthToken = (token: string) => {
  const isSecure = getIsSecureEnvironment();
  const maxAgeSeconds = 60 * 60 * 24; // 24 hours

  const parts = [
    `${TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    `Max-Age=${maxAgeSeconds}`,
    'SameSite=Strict',
  ];

  if (isSecure) {
    parts.push('Secure');
  }

  document.cookie = parts.join('; ');
};

export const getAuthToken = (): string | null => {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie ? document.cookie.split('; ') : [];

  for (const cookie of cookies) {
    const [name, ...rest] = cookie.split('=');
    if (name === TOKEN_COOKIE_NAME) {
      return decodeURIComponent(rest.join('='));
    }
  }

  return null;
};

export const clearAuthToken = () => {
  if (typeof document === 'undefined') return;

  document.cookie = `${TOKEN_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Strict`;
};


