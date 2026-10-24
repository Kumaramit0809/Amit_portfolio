const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
const paramApi = searchParams ? searchParams.get('api') : null;
const envApi = import.meta.env?.VITE_API_URL;
const fallbackApi =
  typeof window !== 'undefined' && window.location.origin && window.location.port !== '5173'
    ? window.location.origin
    : 'https://amit-portfolio-9puh.onrender.com';

export const API = (paramApi || envApi || fallbackApi).replace(/\/+$/, '');

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