// ScheduleContext.js
import React, {createContext, useState, useContext} from 'react';
import api from '../utils/api';
import moment from 'moment';

const ScheduleContext = createContext();

export const useSchedules = () => useContext(ScheduleContext);

export const ScheduleProvider = ({children}) => {
  const [schedules, setSchedules] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tasksToSchedules, setTasksToSchedules] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [todaySelectedTasks, setTodaySelectedTasks] = useState([]);

  const isOverlapping = (task, schedule) => {
    const taskStart = moment(task.startTime);
    const taskEnd = moment(task.endTime);
    const scheduleStart = moment(schedule.startTime);
    const scheduleEnd = moment(schedule.endTime);

    return taskStart.isBefore(scheduleEnd) && taskEnd.isAfter(scheduleStart);
  };

  // 새 스케줄 추가 및 겹치는 태스크 제거 함수
  const addScheduleAndRemoveOverlapping = async newSchedule => {
    try {
      const times = findSurroundingTimes(newSchedule);
      if (!times) {
        throw new Error('Unable to calculate surrounding times');
      }

      const updatedSchedule = {
        ...newSchedule,
        startTime: times.availableStartTime.format(),
        endTime: times.availableEndTime.format(),
      };

      const overlappingTasks = tasksToSchedules.filter(task =>
        isOverlapping(task, updatedSchedule),
      );

      const filteredTasksToSchedules = tasksToSchedules.filter(
        task => !isOverlapping(task, updatedSchedule),
      );

      // Delete overlapping tasks from the server and update toSchedule status
      await Promise.all(
        overlappingTasks.map(async task => {
          await api.delete(`/taskstoschedules/${task._id}`);
          console.log(`Deleted schedule with ID: ${task._id}`);
          await toggleToSchedule(task.taskId);
        }),
      );

      // Log for debugging
      console.log('Successfully updated tasks and schedules');

      // Return the filtered and updated tasks list
      return {
        filteredTasksToSchedules,
        overlappingTasks,
      };
    } catch (error) {
      console.error('Error in addScheduleAndRemoveOverlapping:', error);
      throw error; // Re-throw the error for further handling if needed
    }
  };

  const findSurroundingTimes = item => {
    // 현재 날짜 기준으로 targetHour를 moment 객체로 변환합니다.

    const startTimeMoment = moment.tz(item.startTime, 'Asia/Seoul');
    const endTimeMoment = moment.tz(item.endTime, 'Asia/Seoul');
    const duration = moment.duration(endTimeMoment.diff(startTimeMoment));
    const halfDuration = duration.asMilliseconds() / 2;
    const targetHour = startTimeMoment
      .clone()
      .add(halfDuration, 'milliseconds');

    // targetHour를 사용하여 전체 시간대로 변환
    const targetMoment = targetHour.clone();

    // 스케줄 필터링 및 정렬
    const filteredSchedules = schedules.filter(schedule =>
      moment.tz(schedule.startTime, 'Asia/Seoul').isSame(targetMoment, 'day'),
    );
    const sortedSchedules = filteredSchedules.sort((a, b) =>
      moment
        .tz(a.startTime, 'Asia/Seoul')
        .diff(moment.tz(b.startTime, 'Asia/Seoul')),
    );

    // 하루의 시작과 끝을 한국 시간대로 설정
    let startTime = moment.tz(targetMoment, 'Asia/Seoul').startOf('day');
    let endTime = moment.tz(targetMoment, 'Asia/Seoul').endOf('day');

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
    // 반환할 객체를 구성하여 반환합니다.
    return {
      availableStartTime: startTime,
      availableEndTime: endTime,
    };
  };

  const toggleToSchedule = async taskId => {
    try {
      const response = await api.patch(`/selectedTasks/toggle/${taskId}`);

      if (response.status === 200) {
        console.log('Task updated successfully:', response.data);
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
    return;
  };

  return (
    <ScheduleContext.Provider
      value={{
        schedules,
        setSchedules,
        tasks,
        setTasks,
        tasksToSchedules,
        setTasksToSchedules,
        selectedTasks,
        setSelectedTasks,
        addScheduleAndRemoveOverlapping,
        todaySelectedTasks,
        setTodaySelectedTasks,
      }}>
      {children}
    </ScheduleContext.Provider>
  );
};
