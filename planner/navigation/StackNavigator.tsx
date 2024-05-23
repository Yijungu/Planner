// navigation/StackNavigator.tsx

import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen'; // 로그인 화면 컴포넌트의 경로에 맞게 조정하세요.
import TabNavigator from './TabNavigator'; // 주 탭 네비게이터 컴포넌트의 경로에 맞게 조정하세요.

const Stack = createStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Main"
        component={TabNavigator}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;
