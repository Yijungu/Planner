import React, {useState} from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import moment from 'moment';
import {useColor} from '../../state/ColorContext';
import DayDetailComponent from './DayDetailComponent'; // 추가된 부분

const formatDate = date => date.split('T')[0];
const screenWidth = Dimensions.get('window').width;

const DayComponentSelected = ({
  date,
  isCurrentMonth,
  isToday,
  daySchedule,
  dayTasks,
  openModal,
}) => {
  const {theme} = useColor();
  const dateObject = new Date(date);
  const formattedDate = {
    dateString: dateObject.toISOString().split('T')[0],
    day: dateObject.getDate(),
    month: dateObject.getMonth() + 1,
    year: dateObject.getFullYear(),
  };
  const dayObj = moment(formattedDate.dateString);
  const isSunday = dayObj.day() === 0;

  let dateTextStyle = styles.dateText;

  if (!isCurrentMonth) {
    dateTextStyle = {...dateTextStyle, ...styles.dateTextNotInCurrentMonth};
  } else if (isSunday) {
    dateTextStyle = {...dateTextStyle, ...styles.sundayText};
  }

  const handleDayPress = () => {
    openModal({
      schedule: daySchedule,
      tasks: dayTasks,
      date: formattedDate.dateString,
    });
  };

  return (
    <TouchableOpacity
      onPress={handleDayPress}
      style={isToday ? styles.todayContainer : styles.dayContainer}>
      <View>
        <Text style={dateTextStyle}>{formattedDate.day}</Text>
      </View>
      {dayTasks.map((task, index) => {
        let taskStyle = {
          backgroundColor: theme.complementary[task.color],
          borderColor: theme.complementary[task.color],
        };

        let additionalStyle = {};

        if (!task.done) {
          additionalStyle = {
            opacity: 0.5,
          };
        } else if (task.finish) {
          additionalStyle = {
            shadowColor: theme.fourth,
            shadowOffset: {width: 0, height: 0},
            shadowOpacity: 6,
            shadowRadius: 2,
            elevation: 15,
          };
        }

        return (
          <View
            key={task.title + task.id + index}
            style={[
              styles.eventItem,
              styles.taskItem,
              taskStyle,
              additionalStyle,
            ]}>
            <Text style={styles.eventText}>{task.title.slice(0, 3)}</Text>
          </View>
        );
      })}
      {daySchedule.map((event, index) => {
        return (
          <View
            key={event.startTime + event.id + index}
            style={styles.eventItemSchedule}>
            <Text style={styles.eventText}>
              {moment(event.startTime).format('h')} {event.event.slice(0, 3)}
            </Text>
            <View
              style={[
                styles.marker,
                {backgroundColor: theme.complementary[event.color]},
              ]}></View>
          </View>
        );
      })}
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
    textAlign: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    paddingHorizontal: 2,
  },
  eventItemSchedule: {
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  marker: {
    position: 'absolute',
    left: 0,
    top: 10,
    width: 12,
    height: 4,
    borderRadius: 2,
  },
  eventText: {
    fontSize: 7.5,
    textAlign: 'center',
  },
  taskItem: {
    height: 17,
    borderWidth: 2,
    borderRadius: 4,
  },
  dateText: {
    textAlign: 'center',
    color: 'black',
  },
  todayContainer: {
    width: screenWidth / 7 - 0.000001,
    paddingHorizontal: 8,
    paddingVertical: 5,
    minHeight: 70,
    borderRadius: 10,
    backgroundColor: 'rgba(230, 230, 230, 0.5)',
  },
  dayContainer: {
    width: screenWidth / 7 - 0.000001,
    paddingHorizontal: 8,
    paddingVertical: 5,
    minHeight: 70,
  },
  sundayText: {
    color: 'red',
  },
  dateTextNotInCurrentMonth: {
    color: 'lightgrey',
  },
  todayMarker: {
    fontSize: 12,
    borderRadius: 15,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DayComponentSelected;
