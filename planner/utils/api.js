// api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://localhost:8080', // 서버 URL
});

// 요청 인터셉터 추가
api.interceptors.request.use(
  async config => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터는 이전에 설명한 대로 설정됩니다.
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      try {
        const tokenResponse = await api.post('/auth/refresh', {refreshToken});
        const {accessToken} = tokenResponse.data;
        await AsyncStorage.setItem('accessToken', accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Session has expired, please login again.');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
