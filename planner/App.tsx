// App.tsx

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import StackNavigator from './navigation/StackNavigator'; // 경로는 실제 구조에 맞게 조정하세요.
import {ScheduleProvider} from './state/ScheduleContext';
import {View} from 'react-native';
import {ColorProvider} from './state/ColorContext';
import {UserProvider} from './state/UserContext';
const App = () => {
  return (
    <UserProvider>
      <ScheduleProvider>
        <ColorProvider>
          <NavigationContainer>
            <StackNavigator />
          </NavigationContainer>
        </ColorProvider>
      </ScheduleProvider>
    </UserProvider>
  );
};

export default App;
