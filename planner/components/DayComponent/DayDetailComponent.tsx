import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import moment from 'moment';
import {useColor} from '../../state/ColorContext';

const DayDetailComponent = ({date, schedule, tasks}) => {
  const {theme} = useColor();

  // tasks가 undefined 또는 null일 경우 빈 배열로 초기화
  const safeTasks = tasks || [];

  const renderSchedule = () => {
    return schedule?.map((event, index) => (
      <View
        key={event.id + index}
        style={[
          styles.scheduleItem,
          {backgroundColor: theme.complementary[event.color]},
        ]}>
        <Text
          style={styles.scheduleText}
          numberOfLines={1}
          ellipsizeMode="clip">
          {moment(event.startTime).format('HH:mm')} - {event.event}
        </Text>
      </View>
    ));
  };

  const renderTasks = (taskList, title) => {
    return (
      <View style={styles.taskGroup}>
        <Text style={styles.taskGroupTitle}>{title}</Text>
        <View style={styles.taskRow}>
          {taskList.map((task, index) => (
            <View key={task.id + index} style={styles.taskItem}>
              <View
                style={[
                  styles.taskMarker,
                  {backgroundColor: theme.complementary[task.color]},
                ]}
              />
              <Text
                style={styles.taskText}
                numberOfLines={1}
                ellipsizeMode="tail">
                {task.title}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const undoneTasks = safeTasks.filter(task => !task.done);
  const doneTasks = safeTasks.filter(task => task.done && !task.finish);
  const finishedTasks = safeTasks.filter(task => task.finish);

  return (
    <View style={[styles.container, {backgroundColor: theme.fifth}]}>
      <Text style={styles.title}>{moment(date).format('LL')}</Text>
      <View style={styles.showContainer}>
        <View style={styles.scheduleContainer}>
          <Text style={styles.sectionTitle1}>스케줄</Text>
          <View style={styles.scheduleRow}>{renderSchedule()}</View>
        </View>
        <View style={styles.taskContainer}>
          <Text style={styles.sectionTitle}>태스크</Text>
          <View style={styles.tasksContainer}>
            {renderTasks(undoneTasks, '미완료')}
            {renderTasks(doneTasks, '완료')}
            {renderTasks(finishedTasks, '끝낸')}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 375,
    height: 155,
    padding: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  showContainer: {
    flexDirection: 'row',
  },
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 5,
    // textAlign: 'center',
    color: '#616161',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 3,
    textAlign: 'center',
    color: '#616161',
  },
  sectionTitle1: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 5,
    textAlign: 'center',
    color: '#616161',
  },
  scheduleRow: {},
  scheduleItem: {
    marginVertical: '1%',
    width: 100,
    padding: 5,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scheduleContainer: {
    marginRight: 10,
    width: 100,
    height: 110,
    // backgroundColor: 'white',
    // borderRadius: 10,
  },
  scheduleText: {
    fontSize: 12,
    color: '#616161',
  },
  tasksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  taskGroup: {
    // width: '30%',
    margin: '1%',
    width: 65,
    marginRight: 10,
  },
  taskGroupTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#616161',
  },
  taskRow: {},
  taskItem: {
    margin: '1%',
    width: 65,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskMarker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  taskText: {
    fontSize: 12,
    color: '#616161',
    flexShrink: 1,
    numberOfLines: 1,
    ellipsizeMode: 'tail',
  },
});

export default DayDetailComponent;
