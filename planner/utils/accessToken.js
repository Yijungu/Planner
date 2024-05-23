import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveAccessToken = async token => {
  try {
    await AsyncStorage.setItem('accessToken', token);
  } catch (error) {
    console.error('Error saving access token:', error);
  }
};

export const loadAccessToken = async () => {
  try {
    return await AsyncStorage.getItem('accessToken');
  } catch (error) {
    console.error('Error loading access token:', error);
    return null;
  }
};

export const deleteAccessToken = async () => {
  try {
    await AsyncStorage.removeItem('accessToken');
  } catch (error) {
    console.error('Error deleting access token:', error);
  }
};
