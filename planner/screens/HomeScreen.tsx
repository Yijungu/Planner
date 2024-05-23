import React, {useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateDisplayComponent from '../components/DateDisplay/DateDisplayComponent';
import CalendarComponent from '../components/Calendar/CalendarComponent';
import {globalStyles} from '../assets/styles/globalStyles';
import {useSchedules} from '../state/ScheduleContext';

export default function HomeScreen() {
  const {
    schedules,
    setSchedules,
    tasks,
    setTasks,
    tasksToSchedules,
    setTasksToSchedules,
    selectedTasks,
    setSelectedTasks,
  } = useSchedules();
  // const [schedules, setSchedules] = useState([]);
  // const [tasks, setTasks] = useState([]);
  const formatDate = date => {
    let d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };
  // useState에 오늘 날짜를 기본값으로 설정
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  useEffect(() => {
    // 데이터 로드 함수
    const loadData = async () => {
      try {
        const storedSchedules = await AsyncStorage.getItem('schedules');
        const storedTasks = await AsyncStorage.getItem('tasks');
        const storedTasksToSchedules = await AsyncStorage.getItem(
          'tasksToSchedules',
        );
        const storedSelectedTasks = await AsyncStorage.getItem('selectedTasks');

        if (storedSchedules) setSchedules(JSON.parse(storedSchedules));
        if (storedTasks) setTasks(JSON.parse(storedTasks));
        if (storedTasksToSchedules)
          setTasksToSchedules(JSON.parse(storedTasksToSchedules));
        if (storedSelectedTasks)
          setSelectedTasks(JSON.parse(storedSelectedTasks));
      } catch (error) {
        console.error('Failed to load data', error);
      }
    };

    loadData();
  }, []);

  return (
    <View style={{backgroundColor: 'white', flex: 1}}>
      <DateDisplayComponent onDateSelect={setSelectedDate} />
      <View style={styles.scheduleContainer}>
        <CalendarComponent
          schedule={schedules}
          tasks={tasks}
          date={selectedDate}
          setSchedules={setSchedules}
          tasksToSchedules={tasksToSchedules}
          setTasksToSchedules={setTasksToSchedules}
          selectedTasks={selectedTasks}
          setSelectedTasks={setSelectedTasks}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scheduleContainer: {
    height: '88%',
    backgroundColor: 'white',
  },
});
