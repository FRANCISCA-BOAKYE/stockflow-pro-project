import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL = 'https://stockflow-backend-qwpt.onrender.com';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // web fallback
    const token = typeof localStorage !== 'undefined'
      ? localStorage.getItem('jwt_token')
      : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});