import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import DetailsScreen from '../screens/DetailsScreen';
import {Image} from 'react-native';

// 탭 아이콘 이미지
const tabIcons = {
  HomeScreen: require('../assets/images/HomeButton.png'),
  CalendarScreen: require('../assets/images/CalendarButton.png'),
  DetailsScreen: require('../assets/images/DetailButton.png'),
};

const focusedTabIcons = {
  HomeScreen: require('../assets/images/HomeButtonActive.png'),
  CalendarScreen: require('../assets/images/CalendarButtonActive.png'),
  DetailsScreen: require('../assets/images/DetailButtonActive.png'),
};

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          // focused 상태에 따라 다른 아이콘을 사용
          const iconName = focused
            ? focusedTabIcons[route.name] // 포커스 되었을 때의 아이콘
            : tabIcons[route.name]; // 기본 아이콘

          // 아이콘 반환
          return (
            <Image
              source={iconName}
              style={{
                width: size,
                height: size,
              }}
            />
          );
        },
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          borderTopWidth: 0, // 테두리 없애기
          elevation: 0, // Android에서 그림자 없애기
          shadowOpacity: 0, // iOS에서 그림자 없애기
          backgroundColor: 'white', // 배경 투명도 조절 가능
        },
      })}>
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{tabBarLabel: 'Home'}}
      />
      <Tab.Screen
        name="CalendarScreen"
        component={CalendarScreen}
        options={{tabBarLabel: 'Calendar'}}
      />
      <Tab.Screen
        name="DetailsScreen"
        component={DetailsScreen}
        options={{tabBarLabel: 'Details'}}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
