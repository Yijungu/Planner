import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  Image, // Import Image
} from 'react-native';
import {
  login,
  logout,
  getProfile,
  shippingAddresses,
  unlink,
} from '@react-native-seoul/kakao-login';
import axios from 'axios';
import {
  saveAccessToken,
  loadAccessToken,
  deleteAccessToken,
} from '../utils/accessToken';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveRefreshToken,
  loadRefreshToken,
  deleteRefreshToken,
} from '../utils/refreshToken'; // Adjust paths as necessary
import KaokaoLoginButton from '../assets/images/KakaoLoginButton.png';
import GoogleLoginButton from '../assets/images/GoogleLoginButton.png';
import NaverLoginButton from '../assets/images/NaverLoginButton.png';
import AppInLogo from '../assets/images/AppInLogo.png';
import api from '../utils/api';
import {useUser} from '../state/UserContext';

export default function LoginScreen({navigation}) {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(true);
  const {setUser} = useUser();

  useEffect(() => {
    const tryAutoLogin = async () => {
      try {
        const refreshToken = await loadRefreshToken();

        if (refreshToken) {
          // 자동 로그인을 위해 리프레시 토큰을 사용하여 인증 시도
          const response = await api.post('/auth/refresh', {refreshToken});

          if (response.data.accessToken) {
            await saveAccessToken(response.data.accessToken);
            setUser(response.data.userInfo);
            await fetchData(); // fetchData를 호출하여 기존 시퀀스를 따름
          } else {
            throw new Error('Auto login failed');
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auto login error:', error);
        setLoading(false);
      }
    };

    tryAutoLogin();
  }, []);

  const signInWithKakao = async () => {
    try {
      const token = await login();
      setResult(JSON.stringify(token));

      const response = await api.post('/auth/kakao', {
        accessToken: token.accessToken,
      });

      if (response.data.accessToken && response.data.refreshToken) {
        saveAccessToken(response.data.accessToken);
        saveRefreshToken(response.data.refreshToken);
        setUser(response.data.userInfo);
        fetchData();
      }
    } catch (error) {
      console.error('Login error:', error);
      setResult('Login Failed');
    }
  };

  const fetchData = async () => {
    try {
      // 저장된 액세스 토큰 로드
      const accessToken = await loadAccessToken();

      const [
        scheduleResponse,
        taskResponse,
        tasksToSchedulesResponse,
        selectedTasksResponse,
      ] = await Promise.all([
        axios.get(`http://localhost:8080/schedules/`, {
          headers: {Authorization: `Bearer ${accessToken}`},
        }),
        axios.get(`http://localhost:8080/tasks/`, {
          headers: {Authorization: `Bearer ${accessToken}`},
        }),
        axios.get(`http://localhost:8080/taskstoschedules/`, {
          headers: {Authorization: `Bearer ${accessToken}`},
        }),
        axios.get(`http://localhost:8080/selectedTasks/`, {
          headers: {Authorization: `Bearer ${accessToken}`},
        }),
      ]);

      if (
        scheduleResponse.status === 200 &&
        taskResponse.status === 200 &&
        tasksToSchedulesResponse.status === 200 &&
        selectedTasksResponse.status === 200
      ) {
        await AsyncStorage.multiSet([
          ['schedules', JSON.stringify(scheduleResponse.data)],
          ['tasks', JSON.stringify(taskResponse.data)],
          ['tasksToSchedules', JSON.stringify(tasksToSchedulesResponse.data)],
          ['selectedTasks', JSON.stringify(selectedTasksResponse.data)],
        ]);

        navigation.navigate('Main');
      } else {
        throw new Error('Data fetch failed');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Data Fetch Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* <Image
        source={AppInLogo} // Specify your image URL
        style={styles.logo}
      /> */}
      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={signInWithKakao}>
          <Image
            source={GoogleLoginButton} // Specify your image URL
            style={styles.buttonImage}
          />
        </Pressable>
        <Pressable style={styles.button} onPress={signInWithKakao}>
          <Image
            source={KaokaoLoginButton} // Specify your image URL
            style={styles.buttonImage}
          />
        </Pressable>
        <Pressable style={styles.button} onPress={signInWithKakao}>
          <Image
            source={NaverLoginButton} // Specify your image URL
            style={styles.buttonImage}
          />
        </Pressable>
      </View>
    </View>
  );
}

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f7f7',
  },
  logo: {
    marginTop: 200,
    width: 200,
    height: 200,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    width: 50,
    margin: 20,
  },
  buttonImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain', // This ensures the image scales correctly within the button
  },
});
