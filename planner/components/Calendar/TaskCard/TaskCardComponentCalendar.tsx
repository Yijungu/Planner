import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import TaskWriteModal from '../../../modal/TaskWriteModal';
import {useSchedules} from '../../../state/ScheduleContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../utils/api';
import {useColor} from '../../../state/ColorContext';
import moment from 'moment';

const TaskListComponent = ({task, onUpdateTasks}) => {
  const {theme} = useColor();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const {tasks, setTasks} = useSchedules();
  const [localTasks, setLocalTasks] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);

  useEffect(() => {
    // 'dueDate'가 유효하지 않은 태스크만 필터링하여 상태에 설정
    const invalidDateTasks = tasks.filter(task => {
      return !moment(task.dueDate, moment.ISO_8601, true).isValid();
    });

    setLocalTasks(invalidDateTasks);
  }, [tasks]);

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handleSelectItem = id => {
    setSelectedItemId(id === selectedItemId ? null : id);
  };

  const handleDeleteTask = async id => {
    try {
      const response = await api.delete(`/tasks/${id}`);

      if (response.status === 200) {
        // UI에서 해당 작업 제거
        setLocalTasks(prevTasks => prevTasks.filter(task => task._id !== id));
        setSelectedItemId(null); // 선택된 항목 ID 초기화
        const newTasks = tasks.filter(task => task._id !== id);
        setTasks(newTasks);
        await AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
      } else {
        throw new Error(response.data.message || 'Failed to delete the task');
      }
    } catch (error) {
      console.error('Error:', error.message);
      // 사용자에게 에러 표시
    }
  };

  return (
    <>
      <View style={[styles.cardlist, {backgroundColor: theme.third}]}>
        <ScrollView horizontal={true} style={styles.taskList}>
          <TouchableOpacity style={styles.addCard} onPress={openModal}>
            <View style={[styles.addCardT, {backgroundColor: theme.fourth}]}>
              <Text style={styles.addCardText}>+</Text>
              <Text style={styles.addCardTextKr}>할일 카드</Text>
            </View>
          </TouchableOpacity>
          {localTasks.map((task, index) => (
            <TouchableOpacity
              key={task._id}
              style={[
                styles.card,
                task._id === selectedItemId
                  ? {backgroundColor: 'rgba(218, 180, 157, 0.3)'}
                  : {backgroundColor: theme.complementary[task.color]},
              ]}
              onPress={() => handleSelectItem(task._id)}>
              <Text style={styles.title}>{task.title.slice(0, 4)}</Text>
              {task._id === selectedItemId && (
                <View style={styles.overoverlayContainer}>
                  <TouchableOpacity
                    style={[
                      styles.overlayContainer,
                      {borderTopLeftRadius: 12},
                    ]}>
                    <Text style={styles.overlayText}>수정</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.overlayContainer,
                      {borderTopRightRadius: 12},
                    ]}
                    onPress={() => handleDeleteTask(task._id)}>
                    <Text style={styles.overlayText}>삭제</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <TaskWriteModal
        isVisible={isModalVisible}
        onClose={closeModal}
        onUpdateTasks={onUpdateTasks}
      />
    </>
  );
};

const styles = StyleSheet.create({
  taskList: {},
  addCard: {
    // 카드에 대한 스타일
    marginHorizontal: 4,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: 40,
    width: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardT: {
    width: 15, // 동그라미의 너비
    height: 15, // 동그라미의 높이
    bottom: 4,
    borderRadius: 30, // 둥근 테두리를 만드는데 필요한 반지름 값 (너비와 높이의 반)
    justifyContent: 'center', // 가운데 정렬
    alignItems: 'center', // 가운데 정렬
    // 다른 스타일들...
  },

  addCardText: {
    left: 0.5,
    bottom: 1,
    borderRadius: 30,
    color: 'white',
  },
  addCardTextKr: {
    position: 'absolute',
    width: 38,
    top: 18,
    fontSize: 10,
    borderRadius: 30,
    color: '#999595',
  },
  cardlist: {
    // 카드에 대한 스타일
    // flex: 1,
    // bottom: 30,
    marginHorizontal: 10,
    // marginVertical: 5,
    padding: 10,
    // height: 40,
    borderRadius: 10,
  },
  card: {
    // 카드에 대한 스타일
    marginHorizontal: 4,
    borderRadius: 8,
    height: 40,
    width: 75,
    textAlign: 'center',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    // 제목에 대한 스타일
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    // 설명에 대한 스타일
    fontSize: 14,
  },
  dueDate: {
    // 마감일에 대한 스타일
    fontSize: 12,
    color: '#888',
  },
  overoverlayContainer: {
    position: 'absolute',
    borderRadius: 12,
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  overlayContainer: {
    width: '50%',
    height: '75%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderWidth: 0.3,
    borderColor: '#FFFFFF',
  },

  overlayText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default TaskListComponent;
