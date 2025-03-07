export const deleteCookies = () => {
  document.cookie.split(';').forEach(c => {
    document.cookie = c
      .replace(/^ +/, '')
      .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
  });
};

export const deleteCookie = name => {
  document.cookie = name + `=;expires=${new Date().toUTCString()};path=/`;
};

export const getCookie = name => {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, '');
};

export const setCookie = (name, value, expires) => {
  document.cookie = `${name}=${value}; expires=${expires};path=/`;
};
