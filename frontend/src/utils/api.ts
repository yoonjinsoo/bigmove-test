import axios from 'axios';
import CryptoJS from 'crypto-js';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'your-secret-key';

// 토큰 암호화/복호화 함수
const encryptToken = (token: string): string => {
  return CryptoJS.AES.encrypt(token, ENCRYPTION_KEY).toString();
};

const decryptToken = (encryptedToken: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedToken, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// 토큰 저장/조회 함수
export const setToken = (token: string) => {
  const encryptedToken = encryptToken(token);
  localStorage.setItem('token', encryptedToken);
};

export const getToken = (): string | null => {
  const encryptedToken = localStorage.getItem('token');
  if (!encryptedToken) return null;
  try {
    return decryptToken(encryptedToken);
  } catch (error) {
    localStorage.removeItem('token');
    return null;
  }
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 인터셉터 설정
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});