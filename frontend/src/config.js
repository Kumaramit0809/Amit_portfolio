const BACKEND_PROD_URL = 'https://amit-portfolio-9puh.onrender.com';

function getApiUrl() {
  if (typeof window !== 'undefined') {
    // 1. Explicit query param override: ?api=https://...
    const param = new URLSearchParams(window.location.search).get('api');
    if (param) return param;

    // 2. Local development on localhost/127.0.0.1
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]';

    if (isLocalhost) {
      return import.meta.env?.VITE_API_URL || 'http://localhost:8000';
    }
  }

  // 3. Deployed production (Netlify, Vercel, Render, etc.)
  // Never point to localhost on a deployed website
  const envApi = import.meta.env?.VITE_API_URL;
  if (envApi && !envApi.includes('localhost') && !envApi.includes('127.0.0.1')) {
    return envApi;
  }

  return BACKEND_PROD_URL;
}

export const API = getApiUrl().replace(/\/+$/, '');

export const AVATAR_URL = '';

export const LINKS = {
  github: 'https://github.com/Kumaramit0809',
  leetcode: 'https://leetcode.com/u/Amit_Kumar_08/',
  linkedin: 'https://linkedin.com/in/amit-kumar-889b53253',
};

export const calm =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;