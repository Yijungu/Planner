import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TaskCardComponent from '../components/Calendar/TaskCard/TaskCardComponentCalendar';
import ScheduleModal from '../components/CalendarModal/CalendarModal';
import {useSchedules} from '../state/ScheduleContext';
import CustomCalendar from '../components/CustomCalendar';
import DayDetailComponent from '../components/DayComponent/DayDetailComponent';

const CalendarScreen = () => {
  const {schedules, setSchedules, tasks, setTasks} = useSchedules();
  const [modalData, setModalData] = useState({schedule: [], tasks: []});
  const [isModalVisible, setModalVisible] = useState(false);
  const [useSelectedComponent, setUseSelectedComponent] = useState(false); // 스위치 상태 관리
  const [selectedDateDetail, setSelectedDateDetail] = useState({});

  useEffect(() => {
    setSelectedDateDetail({});
  }, [useSelectedComponent]);

  const openModal = date => {
    setModalData({
      date: date.date,
      schedule: date.schedule,
      tasks: date.tasks,
    });

    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <CustomCalendar
        schedules={schedules}
        tasks={tasks}
        openModal={openModal}
        useSelectedComponent={useSelectedComponent}
        setUseSelectedComponent={setUseSelectedComponent}
        setSelectedDateDetail={setSelectedDateDetail}
      />

      <ScheduleModal
        isVisible={isModalVisible}
        schedule={modalData.schedule}
        tasks={modalData.tasks}
        date={modalData.date}
        onClose={() => setModalVisible(false)}
        onUpdateSchedules={newSchedule => {
          setSchedules([...schedules, newSchedule]); // 스케줄 상태 업데이트
          // setModalVisible(false); // 모달 닫기
        }}
        onUpdateTasks={newTask => {
          setTasks([...tasks, newTask]); // 스케줄 상태 업데이트
        }}
      />
      {!useSelectedComponent && (
        <TaskCardComponent
          task={tasks}
          onUpdateTasks={newTask => {
            setTasks([...tasks, newTask]); // 스케줄 상태 업데이트
            setModalVisible(false); // 모달 닫기
          }}
        />
      )}
      {useSelectedComponent && selectedDateDetail.date && (
        <DayDetailComponent
          date={selectedDateDetail.date}
          schedule={selectedDateDetail.schedule}
          tasks={selectedDateDetail.tasks}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 20,
  },
  // 다른 스타일...
});

export default CalendarScreen;
