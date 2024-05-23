/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as planner} from './app.json';
import 'react-native-gesture-handler';
import {enableScreens} from 'react-native-screens';

enableScreens();

AppRegistry.registerComponent(planner, () => App);
