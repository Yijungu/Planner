import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const saveRefreshToken = async token => {
  try {
    await AsyncStorage.setItem('refreshToken', token);
  } catch (error) {
    console.error('Error saving refresh token:', error);
  }
};

export const loadRefreshToken = async () => {
  try {
    return await AsyncStorage.getItem('refreshToken');
  } catch (error) {
    console.error('Error loading refresh token:', error);
    return null;
  }
};

export const deleteRefreshToken = async () => {
  try {
    await AsyncStorage.removeItem('refreshToken');
  } catch (error) {
    console.error('Error deleting refresh token:', error);
  }
};

export const refreshTokens = async () => {
  try {
    const refreshToken = await loadRefreshToken();
    const response = await axios.post('http://localhost:8000/auth/refresh', {
      refreshToken,
    });

    if (response.data.accessToken) {
      await saveAccessToken(response.data.accessToken);
      await saveRefreshToken(response.data.refreshToken);
      return {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      };
    }
    return null;
  } catch (error) {
    console.error('Refresh token error:', error);
    return null;
  }
};
