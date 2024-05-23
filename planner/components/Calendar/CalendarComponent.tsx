// CalendarComponent.tsx
import React, {useState, useRef, useEffect} from 'react';
import {View, Alert} from 'react-native';
import {DragDropProvider} from '../../state/DragDropContext';
import ScheduleListComponent from './ScheduleList/ScheduleListComponent';
import TaskCardComponent from './TaskCard/TaskCardComponent';
import styles from './CalendarComponentStyles';
import {Host} from 'react-native-portalize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import 'moment-timezone';
import 'moment/locale/ko';
import api from '../../utils/api';
import {useColor} from '../../state/ColorContext';

moment.locale('ko');

const CalendarComponent = ({
  schedule,
  tasks,
  date,
  setSchedules,
  tasksToSchedules,
  setTasksToSchedules,
  selectedTasks,
  setSelectedTasks,
}) => {
  const {theme} = useColor();
  const scheduleListRef = useRef(null);
  const taskCardRef = useRef(null);
  const [totalSchedules, setTotalSchedules] = useState([]);
  const [startHourOffset, setStartHourOffset] = useState(8); // 기본적으로 8am
  const [endHourOffset, setEndHourOffset] = useState(31); // 기본적으로 33시간 후 = 15. 5pm

  useEffect(() => {
    // tasksToSchedules에서 targetTime 프로퍼티를 제외
    if (tasksToSchedules) {
      setTotalSchedules([...schedule, ...tasksToSchedules]);
    } else {
      // schedule 배열과 수정된 tasksToSchedules 배열을 합치기
      setTotalSchedules([...schedule]);
    }
  }, [schedule, tasksToSchedules]);

  const addTaskToSelected = async (item, dropX, dropY) => {
    try {
      const measureResult = await new Promise((resolve, reject) => {
        taskCardRef.current.measure(({x, y, width, height, pageX, pageY}) => {
          resolve({x, y, width, height, pageX, pageY});
        });
      });

      const {x, y, width, height} = measureResult;

      if (
        dropX >= x &&
        dropX <= x + width &&
        dropY >= y &&
        dropY <= y + height
      ) {
        setSelectedTasks(currentTasks => {
          return currentTasks.map(task => {
            // item.taskId와 task의 _id가 같다면, toSchedule을 false로 설정
            if (task._id === item.taskId) {
              return {...task, toSchedule: false};
            }
            // 다른 경우에는 task를 변경 없이 반환
            return task;
          });
        });
        toggleToSchedule(item.taskId);
        const response = await api.delete(`/taskstoschedules/${item._id}`);
        const {availableStartTime, availableEndTime} = findSurroundingTimes(
          schedule,
          item.targetTime,
          date,
        );
        const updatedTasksToSchedules = tasksToSchedules.filter(
          task => task._id !== item._id,
        );

        const adjustSchedules = adjustScheduleToTaskTimes(
          updatedTasksToSchedules,
          date,
          availableStartTime,
          availableEndTime,
        );

        let storedTasksToSchedules = updatedTasksToSchedules;
        if (adjustSchedules) {
          const response = await api.post('/taskstoschedules', adjustSchedules);
          const addedSchedule = response.data;

          addedSchedule.forEach(schedule => {
            const index = storedTasksToSchedules.findIndex(
              s => s._id === schedule._id,
            );
            if (index !== -1) {
              // _id가 일치하는 항목이 있으면 업데이트
              storedTasksToSchedules[index] = schedule;
            } else {
              // 일치하는 항목이 없으면 배열에 추가
              storedTasksToSchedules.push(schedule);
            }
          });
          await AsyncStorage.setItem(
            'tasksToSchedules',
            JSON.stringify(storedTasksToSchedules),
          );
        } else {
          // 로컬 스토리지 업데이트
          await AsyncStorage.setItem(
            'tasksToSchedules',
            JSON.stringify(storedTasksToSchedules),
          );
        }
        setTasksToSchedules(storedTasksToSchedules); // 상태 업데이트
        setTotalSchedules([...schedule, ...tasksToSchedules]);
        if (response.status === 200) {
          return true;
        } else {
          throw new Error('Failed to delete the task from database');
        }
      } else {
        console.log('Dropped outside the TaskCardComponent');
        return false;
      }
    } catch (error) {
      console.error('Error measuring TaskCardComponent:', error);
      return false;
    }
  };

  const toggleToSchedule = async taskId => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken'); // 액세스 토큰 로드

      const response = await api.patch(`/selectedTasks/toggle/${taskId}`);

      if (response.status === 200) {
        console.log('Task updated successfully:');
        return response.data; // 업데이트된 작업 정보 반환
      } else {
        throw new Error(
          response.data.message || 'Failed to toggle toSchedule property',
        );
      }
    } catch (error) {
      console.error('Error toggling toSchedule:', error.message);
      throw error; // 에러를 호출자에게 전파
    }
  };

  const handleDrop = async (item, dropX, dropY) => {
    // Make this async

    try {
      // measure 함수를 Promise로 감싸기
      const measureResult = await new Promise((resolve, reject) => {
        scheduleListRef.current.measure(
          ({x, y, width, height, pageX, pageY, scrollOffset}) => {
            resolve({x, y, width, height, pageX, pageY, scrollOffset});
          },
        );
      });

      const {x, y, width, height, scrollOffset} = measureResult;

      if (
        dropX >= x &&
        dropX <= x + width &&
        dropY >= y &&
        dropY <= y + height
      ) {
        const dateInKST = moment.tz(date, 'Asia/Seoul');
        let startTimeT = moment(dateInKST).add(startHourOffset, 'hours');

        const dropPositionY = dropY - y + scrollOffset;
        const minutesPerPixel = 60 / 50;
        let droppedMinutes = dropPositionY * minutesPerPixel;

        // Round to nearest 15 minutes
        droppedMinutes = Math.round(droppedMinutes / 15) * 15;

        const hours = Math.floor(droppedMinutes / 60);
        const minutes = droppedMinutes % 60;

        const startTime = moment(startTimeT)
          .add(hours, 'hours')
          .add(minutes, 'minutes');
        const targetTime = moment.tz(startTime, 'Asia/Seoul');

        if (isOverlapping(schedule, targetTime)) {
          Alert.alert('시간 겹칩니다.');
          return false;
        } else {
          const {availableStartTime, availableEndTime} = findSurroundingTimes(
            schedule,
            targetTime,
            date,
          );

          const newTaskToSchedule = {
            startTime: availableStartTime.toISOString(),
            endTime: availableEndTime.toISOString(),
            event: item.title,
            color: item.color,
            targetTime: new Date(
              (availableStartTime + availableEndTime) / 2,
            ).toISOString(),
            taskId: item._id,
          };

          const adjustSchedules = adjustScheduleTimes(
            newTaskToSchedule,
            tasksToSchedules,
            date,
            availableStartTime,
            availableEndTime,
          );

          const response = await api.post('/taskstoschedules', adjustSchedules);

          const addedSchedule = response.data;

          const storedTasksToSchedules = tasksToSchedules
            ? tasksToSchedules
            : [];

          addedSchedule.forEach(schedule => {
            const index = storedTasksToSchedules.findIndex(
              s => s._id === schedule._id,
            );
            if (index !== -1) {
              // _id가 일치하는 항목이 있으면 업데이트
              storedTasksToSchedules[index] = schedule;
            } else {
              // 일치하는 항목이 없으면 배열에 추가
              storedTasksToSchedules.push(schedule);
            }
          });

          await AsyncStorage.setItem(
            'tasksToSchedules',
            JSON.stringify(storedTasksToSchedules),
          );
          toggleToSchedule(item._id);

          setSelectedTasks(currentTasks => {
            return currentTasks.map(task => {
              // item.taskId와 task의 _id가 같다면, toSchedule을 false로 설정
              if (task._id === item._id) {
                return {...task, toSchedule: true};
              }
              // 다른 경우에는 task를 변경 없이 반환
              return task;
            });
          });

          setTasksToSchedules(storedTasksToSchedules);
          setTotalSchedules([...schedule, ...tasksToSchedules]);
          return true;
        }
      } else {
        console.log('Dropped outside the ScheduleList');
        return false;
      }
    } catch (error) {
      console.error('Error handling drop:', error);
      return false;
    }
  };

  const findSurroundingTimes = (schedules, targetHour, date) => {
    // 현재 날짜 기준으로 targetHour를 moment 객체로 변환합니다.

    const dateInKST = moment.tz(date, 'Asia/Seoul');

    // 시작 시간과 끝 시간을 offset에 맞춰 설정
    let startTime = moment(dateInKST).add(startHourOffset, 'hours');
    let endTime = moment(dateInKST).add(endHourOffset, 'hours');

    // 스케줄 필터링
    const filteredSchedules = schedules.filter(schedule => {
      const scheduleStart = moment.tz(schedule.startTime, 'Asia/Seoul');
      return scheduleStart.isBetween(startTime, endTime, null, '[]');
    });

    // targetHour와 날짜를 합쳐서 전체 시간대로 변환
    const targetMoment = moment.tz(targetHour, 'Asia/Seoul');

    // 스케줄 필터링 및 정렬

    const sortedSchedules = filteredSchedules.sort((a, b) =>
      moment
        .tz(a.startTime, 'Asia/Seoul')
        .diff(moment.tz(b.startTime, 'Asia/Seoul')),
    );

    // 하루의 시작과 끝을 한국 시간대로 설정

    for (let i = 0; i < sortedSchedules.length; i++) {
      const currentStart = moment.tz(
        sortedSchedules[i].startTime,
        'Asia/Seoul',
      );
      const currentEnd = moment.tz(sortedSchedules[i].endTime, 'Asia/Seoul');
      // 타겟 시간이 현재 스케줄의 시작 전에 위치할 때
      if (targetMoment.isBefore(currentStart)) {
        endTime = currentStart;
        if (i > 0) {
          startTime = moment.tz(sortedSchedules[i - 1].endTime, 'Asia/Seoul');
        }
        break; // 더 이상 확인할 필요가 없으므로 반복을 종료합니다.
      }

      // 타겟 시간이 현재 스케줄 내에 위치할 때, 다음 스케줄의 시작 시간을 찾습니다.
      if (i === sortedSchedules.length - 1) {
        startTime = currentEnd;
      }
    }
    console.log('dateInKST', dateInKST);
    console.log('startTime', startTime);
    console.log('endTime', endTime);
    // 반환할 객체를 구성하여 반환합니다.
    return {
      availableStartTime: startTime,
      availableEndTime: endTime,
    };
  };

  const adjustScheduleToTaskTimes = (
    tasksToSchedules,
    date,
    startTime,
    endTime,
  ) => {
    const dateInKST = moment.tz(date, 'Asia/Seoul');
    let startTimeT = moment(dateInKST).add(startHourOffset, 'hours');
    let endTimeT = moment(dateInKST).add(endHourOffset, 'hours');

    let filteredTasks = tasksToSchedules.filter(task =>
      moment
        .tz(task.targetTime, 'Asia/Seoul')
        .isBetween(startTimeT, endTimeT, null, '[]'),
    );
    const sortedTasks = filteredTasks.sort((a, b) =>
      moment
        .tz(a.targetTime, 'Asia/Seoul')
        .diff(moment.tz(b.targetTime, 'Asia/Seoul')),
    );

    let count = 0;
    let tasksInRange = [];

    sortedTasks.forEach(task => {
      const taskTime = moment.tz(task.targetTime, 'Asia/Seoul');
      if (taskTime.isBetween(startTime, endTime, null, '[]')) {
        count++;
        tasksInRange.push(task);
      }
    });
    if (count == 0) {
      return false;
    }
    const duration = endTime.diff(startTime);
    const interval = duration / count;
    let currentStart = startTime.clone();

    const updatedTasks = tasksInRange.map(task => {
      const newStart = currentStart.clone();
      const newEnd = currentStart.add(interval);
      currentStart = newEnd.clone();
      return {
        ...task,
        startTime: newStart.format(),
        endTime: newEnd.format(),
      };
    });

    return updatedTasks;
  };

  const adjustScheduleTimes = (
    newTaskToSchedule,
    tasksToSchedules,
    date,
    startTime,
    endTime,
  ) => {
    const dateInKST = moment.tz(date, 'Asia/Seoul');
    let startTimeT = moment(dateInKST).add(startHourOffset, 'hours');
    let endTimeT = moment(dateInKST).add(endHourOffset, 'hours');

    let filteredTasks = tasksToSchedules.filter(task =>
      moment
        .tz(task.targetTime, 'Asia/Seoul')
        .isBetween(startTimeT, endTimeT, null, '[]'),
    );
    filteredTasks.push(newTaskToSchedule);
    const sortedTasks = filteredTasks.sort((a, b) =>
      moment
        .tz(a.targetTime, 'Asia/Seoul')
        .diff(moment.tz(b.targetTime, 'Asia/Seoul')),
    );

    let count = 0;
    let tasksInRange = [];

    sortedTasks.forEach(task => {
      const taskTime = moment.tz(task.targetTime, 'Asia/Seoul');
      if (taskTime.isBetween(startTime, endTime, null, '[]')) {
        count++;
        tasksInRange.push(task);
      }
    });

    const duration = endTime.diff(startTime);
    const interval = duration / count;
    let currentStart = startTime.clone();

    const updatedTasks = tasksInRange.map(task => {
      const newStart = currentStart.clone();
      const newEnd = currentStart.add(interval);
      currentStart = newEnd.clone();
      return {
        ...task,
        startTime: newStart.format(),
        endTime: newEnd.format(),
        // targetTime: currentStart.add(newEnd).format(),
      };
    });

    return updatedTasks;
  };

  const isOverlapping = (existingSchedules, targetTime) => {
    // Convert the new schedule's start and end times to moment objects
    const newTime = moment(targetTime);

    // Loop through the existing schedules to check for overlaps
    return existingSchedules.some(schedule => {
      // Convert each existing schedule's start and end times to moment objects
      const existingStart = moment(schedule.startTime);
      const existingEnd = moment(schedule.endTime);

      // Check if the new schedule starts or ends within an existing one
      const newTimeInside = newTime.isBetween(
        existingStart,
        existingEnd,
        null,
        '[)',
      );

      // Return true if any overlap is found
      return newTimeInside;
    });
  };

  return (
    <DragDropProvider>
      <View style={styles.container}>
        <ScheduleListComponent
          ref={scheduleListRef}
          schedule={totalSchedules}
          dateString={date}
          handleDrop={addTaskToSelected}
          setTotalSchedules={setTotalSchedules}
          startHourOffset={startHourOffset}
          setStartHourOffset={setStartHourOffset}
          endHourOffset={endHourOffset}
          setEndHourOffset={setEndHourOffset}
        />
        <TaskCardComponent
          ref={taskCardRef}
          schedules={schedule}
          tasks={tasks}
          selectedTasks={selectedTasks}
          setSelectedTasks={setSelectedTasks}
          dateString={date}
          handleDrop={handleDrop}
          setTasksToSchedules={setTasksToSchedules}
          startHourOffset={startHourOffset}
          endHourOffset={endHourOffset}
        />
      </View>
    </DragDropProvider>
  );
};

export default CalendarComponent;
