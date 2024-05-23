import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import DayComponent from './DayComponent/DayComponent2';
import DayComponentSelected from './DayComponent/DayComponentSelected'; // 새로운 컴포넌트 임포트
import {useSchedules} from '../state/ScheduleContext';
import CustomSwitch from './Switch';

const screenWidth = Dimensions.get('window').width;
const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const CustomCalendar = ({schedules, tasks, openModal}) => {
  const {selectedTasks} = useSchedules();
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [useSelectedComponent, setUseSelectedComponent] = useState(false); // 스위치 상태 관리
  const scrollViewRef = useRef(null);

  // 초기 렌더링 후 스크롤 위치를 중앙으로 설정
  useEffect(() => {
    scrollViewRef.current?.scrollTo({x: screenWidth, animated: false});
  }, []);

  const handleScroll = event => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    if (contentOffsetX < screenWidth / 2) {
      // 왼쪽으로 스크롤한 경우
      setCurrentMonth(prev => prev.clone().subtract(1, 'month'));
    } else if (contentOffsetX > screenWidth * 1.5) {
      // 오른쪽으로 스크롤한 경우
      setCurrentMonth(prev => prev.clone().add(1, 'month'));
    }
    // 스크롤 위치를 다시 중앙으로 리셋
    scrollViewRef.current?.scrollTo({x: screenWidth, animated: false});
  };

  const renderDayOfWeekHeader = () => {
    return (
      <View style={styles.daysOfWeekContainer}>
        {daysOfWeek.map((day, index) => (
          <Text key={index} style={styles.dayOfWeek}>
            {day}
          </Text>
        ))}
      </View>
    );
  };

  const renderMonth = month => {
    const startDay = month.clone().startOf('month').startOf('week');
    const endDay = month.clone().endOf('month').endOf('week');
    const day = startDay.clone().subtract(1, 'day');
    const daysArray = [];
    while (day.isBefore(endDay, 'day')) {
      daysArray.push(day.add(1, 'day').clone());
    }

    return (
      <View style={styles.monthContainer}>
        <Text style={styles.header}>{month.format('MMMM YYYY')}</Text>
        {renderDayOfWeekHeader()}
        {daysArray.map((day, index) => {
          const dateString = day.format('YYYY-MM-DD');
          const daySchedule = schedules.filter(
            schedule =>
              moment(schedule.startTime).format('YYYY-MM-DD') === dateString,
          );
          const dayTasks = tasks.filter(
            task => moment(task.dueDate).format('YYYY-MM-DD') === dateString,
          );
          const daySelectedTasks = selectedTasks.filter(
            task =>
              moment(task.selectedDate).format('YYYY-MM-DD') === dateString,
          );
          const isCurrentMonth = day.month() === month.month();
          const isToday = day.isSame(moment(), 'day');

          const DayComponentToRender = useSelectedComponent
            ? DayComponentSelected
            : DayComponent;

          return (
            <DayComponentToRender
              key={index}
              date={dateString}
              daySchedule={daySchedule}
              dayTasks={useSelectedComponent ? daySelectedTasks : dayTasks}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              openModal={openModal}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.switchContainer}>
        <CustomSwitch
          value={useSelectedComponent}
          onValueChange={setUseSelectedComponent}
        />
      </View>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        onMomentumScrollEnd={handleScroll}
        showsHorizontalScrollIndicator={false}>
        {renderMonth(currentMonth.clone().subtract(1, 'month'))}
        {renderMonth(currentMonth)}
        {renderMonth(currentMonth.clone().add(1, 'month'))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // 스타일 정의
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchContainer: {
    position: 'absolute',
    top: 12,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    zIndex: 999,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3C3C43',
    padding: 10,
  },
  monthContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: screenWidth,
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: screenWidth,
    backgroundColor: '#FFFFFF', // 요일 배경색, 원하는 색으로 변경 가능
    paddingVertical: 8, // 요일 상하 패딩
  },
  dayOfWeek: {
    textAlign: 'center',
    flex: 1,
    fontSize: 12,
    color: 'gray',
  },
});

export default CustomCalendar;
