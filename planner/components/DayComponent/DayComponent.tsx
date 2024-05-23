//DayComponent.tsx
import React from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import moment from 'moment';
import {useColor} from '../../state/ColorContext';

const formatDate = date => date.split('T')[0];

const DayComponent = ({
  key,
  date,
  state,
  daySchedule,
  dayTasks,
  onOpenModal,
}) => {
  const dayObj = moment(date.dateString);
  const isToday = state === 'today';
  const isSunday = dayObj.day() === 0;
  const {theme} = useColor();
  let dateTextStyle = styles.dateText;

  if (state === 'disabled') {
    dateTextStyle = {...dateTextStyle, ...styles.dateTextNotInCurrentMonth};
  } else if (isSunday) {
    dateTextStyle = {...dateTextStyle, ...styles.sundayText};
  }

  // 해당 날짜에 대한 스케줄과 태스크를 찾습니다.
  const dayToSchedule = daySchedule.filter(
    event => formatDate(event.startTime) === date.dateString,
  );
  const dayToTasks = dayTasks.filter(
    task => formatDate(task.dueDate) === date.dateString,
  );

  // 모달을 여는 함수를 호출합니다.
  const handleDayPress = () => {
    onOpenModal({
      schedule: dayToSchedule,
      tasks: dayToTasks,
      date: date.dateString,
    });
  };

  return (
    <TouchableOpacity
      onPress={handleDayPress}
      style={isToday ? styles.todayMarker : styles.dayContainer}>
      <View style={isToday ? styles.todayMarker : undefined}>
        <Text style={dateTextStyle}>{date.day}</Text>
      </View>
      {dayToSchedule.map(event, index => (
        <View key={event.startTime + event.id + index} style={styles.eventItem}>
          <View style={[styles.marker, {backgroundColor: event.color}]} />
          <Text style={styles.eventText}>{event.event.slice(0, 3)}</Text>
        </View>
      ))}
      {/* 태스크 아이템 렌더링 */}
      {dayToTasks.map(task, index => (
        <View
          key={task.dateDue + task.id + index}
          style={[
            styles.eventItem,
            styles.taskItem,
            {
              borderColor: theme.primary, // 테두리 색상
              backgroundColor: theme.primary,
            },
          ]}>
          <Text style={styles.eventText}>{task.title.slice(0, 3)}</Text>
        </View>
      ))}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
    paddingHorizontal: 3,
  },
  marker: {
    width: 6,
    height: 20,
    borderRadius: 3,
    marginRight: 3,
  },
  eventText: {
    fontSize: 10,
  },
  eventMarker: {
    width: 6,
    height: 20,
    borderRadius: 3,
    marginRight: 4,
  },
  taskItem: {
    borderWidth: 2,
    borderRadius: 10, // 타원형 테두리의 곡률을 낮춥니다.
    borderColor: '#DAB49D', // 테두리 색상
    backgroundColor: '#DAB49D',
  },
  scheduleItem: {
    // Schedule 아이템에 대한 스타일을 유지합니다.
  },
  taskMarker: {
    width: 20, // 타원의 너비를 더 넓게 설정
    height: 6, // 타원의 높이를 줄여서 더 납작하게 만듭니다.
    borderRadius: 3, // 낮은 곡률로 설정
    backgroundColor: 'black', // 타원의 색상
    marginRight: 4,
  },
  dateText: {
    textAlign: 'center',
    color: 'black',
  },
  dayContainer: {
    // justifyContent: 'center',
    // alignItems: 'center',
    margin: 5,
    height: 55,
  },
  sundayText: {
    color: 'red',
  },
  dateTextNotInCurrentMonth: {
    color: 'lightgrey',
  },
  todayMarker: {
    // top: -5,
    width: 20,
    height: 20,
    fontSize: 12,
    borderRadius: 15,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DayComponent;
