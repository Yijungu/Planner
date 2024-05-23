import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import {useSchedules} from '../state/ScheduleContext';
import moment from 'moment';
import api from '../utils/api';
import {useColor} from '../state/ColorContext';
import TaskMakeSchedule from './TaskMakeSchedule';
import TaskWriteModal from './TaskWriteModal';

const TaskMakeModal = ({
  schedules,
  date,
  onClose,
  updateSelectedTask,
  visible,
  selectedInputTasks,
  selectedNonVisibleTasks,
  setTasksToSchedules,
  startHourOffset,
  endHourOffset,
}) => {
  const {theme} = useColor();
  const {tasks, setTasks} = useSchedules();
  const [datesWithTasks, setDatesWithTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [noTasksMessageVisible, setNoTasksMessageVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    setSelectedTasks(selectedInputTasks);
  }, [selectedInputTasks]);

  useEffect(() => {
    const relevantDates = tasks
      .filter(task => {
        const taskDate = new Date(task.dueDate);
        return !isNaN(taskDate.getTime()) && taskDate >= new Date(date); // 유효한 날짜인지 확인
      })
      .map(task => task.dueDate.split('T')[0]);

    // 중복을 제거하고 정렬
    const uniqueDates = Array.from(new Set(relevantDates)).sort();
    setDatesWithTasks(uniqueDates);

    // 할일이 없으면 메시지를 표시합니다.
    setNoTasksMessageVisible(uniqueDates.length === 0);
  }, [tasks, date]);

  const handleSelectTask = task => {
    setSelectedTasks(prevTasks => {
      if (prevTasks.find(t => t._id === task._id)) {
        // 이미 선택된 경우 제거합니다.
        return prevTasks.filter(t => t._id !== task._id);
      } else {
        return [...prevTasks, task];
      }
    });
  };
  const closeTaskWriteModal = () => {
    setIsModalVisible(false);
  };
  const calculateDaysDifference = taskDate => {
    const startDate = moment(date);
    const endDate = moment(taskDate);
    const daysDiff = endDate.diff(startDate, 'days');
    return daysDiff > 0 ? `D-${daysDiff}` : `D+${Math.abs(daysDiff)}`;
  };

  const formatDateWithDayOfWeek = dateString => {
    return moment(dateString).locale('ko').format('M월 D일 (ddd)');
  };
  // 주어진 날짜에 대한 태스크를 렌더링하는 함수
  const renderTasksForDate = taskDate => {
    const formattedTaskDate = moment(taskDate).format('YYYY-MM-DD');
    const filteredTasks = tasks
      .filter(task => {
        const taskDueDate = moment(task.dueDate).format('YYYY-MM-DD');
        return taskDueDate === formattedTaskDate;
      })
      .filter(
        task =>
          !selectedNonVisibleTasks.some(
            nonVisible => nonVisible._id === task._id,
          ),
      );

    return (
      <FlatList
        data={filteredTasks}
        keyExtractor={task => task._id}
        renderItem={({item: task}) => {
          // 선택된 태스크인지 확인
          const isSelected = selectedTasks.some(t => t._id === task._id);

          return (
            <TouchableOpacity
              style={
                isSelected
                  ? [
                      styles.selectedTaskItem,
                      {backgroundColor: theme.complementary[task.color]},
                    ]
                  : [
                      styles.taskItem,
                      {
                        backgroundColor: theme.complementary[task.color],
                        opacity: 0.5,
                      },
                    ]
              }
              onPress={() => handleSelectTask(task)}>
              <Text
                style={isSelected ? styles.selectedTaskText : styles.taskText}>
                {task.title.slice(0, 4)}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          <TouchableOpacity
            style={[styles.selectedTaskItem, {backgroundColor: theme.primary}]}
            onPress={() => setIsModalVisible(true)}>
            <Text style={styles.addCardText}>+</Text>
            <TaskWriteModal
              isVisible={isModalVisible}
              onClose={closeTaskWriteModal}
              onUpdateTasks={newTask => {
                setTasks([...tasks, newTask]); // 스케줄 상태 업데이트
              }}
              date={formattedTaskDate}
            />
          </TouchableOpacity>
        }
      />
    );
  };

  const renderInvalidDateTasks = () => (
    <FlatList
      data={tasks
        .filter(task => !moment(task.dueDate, moment.ISO_8601, true).isValid())
        .filter(
          task =>
            !selectedNonVisibleTasks.some(
              nonVisible => nonVisible._id === task._id,
            ),
        )}
      keyExtractor={task => task._id}
      renderItem={({item: task}) => {
        // 선택된 태스크인지 확인
        const isSelected = selectedTasks.some(t => t._id === task._id);

        return (
          <TouchableOpacity
            style={
              isSelected
                ? [
                    styles.taskItem,
                    {
                      backgroundColor: theme.complementary[task.color],
                    },
                  ]
                : [
                    styles.taskItem,
                    {
                      backgroundColor: theme.complementary[task.color],
                      opacity: 0.5,
                    },
                  ]
            }
            onPress={() => handleSelectTask(task)}>
            <Text
              style={isSelected ? styles.selectedTaskText : styles.taskText}>
              {task.title.slice(0, 4)}
            </Text>
          </TouchableOpacity>
        );
      }}
      style={[{minWidth: 200}]}
      ListFooterComponent={
        <TouchableOpacity
          style={[styles.selectedTaskItem, {backgroundColor: theme.primary}]}
          onPress={() => setIsModalVisible(true)}>
          <Text style={styles.addCardText}>+</Text>
          <TaskWriteModal
            isVisible={isModalVisible}
            onClose={closeTaskWriteModal}
            onUpdateTasks={newTask => {
              setTasks([...tasks, newTask]); // 스케줄 상태 업데이트
            }}
          />
        </TouchableOpacity>
      }
    />
  );

  const renderSelectedTasks = () => {
    // 날짜별로 작업을 그룹화
    const groupedTasks = selectedTasks.reduce((acc, task) => {
      const date = task.dueDate.split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
      return acc;
    }, {});

    // 날짜 키를 사용하여 그룹화된 작업을 배열로 변환하고, "Invalid date"가 맨 앞으로 오도록 날짜순으로 정렬
    const sortedGroupedTasks = Object.entries(groupedTasks).sort(
      ([date1], [date2]) => {
        // "Invalid date"를 체크
        const isValidDate1 = moment(date1, moment.ISO_8601, true).isValid();
        const isValidDate2 = moment(date2, moment.ISO_8601, true).isValid();

        if (!isValidDate1 && isValidDate2) {
          return -1; // 첫 번째 날짜가 유효하지 않고, 두 번째 날짜가 유효하면 첫 번째를 앞으로
        } else if (isValidDate1 && !isValidDate2) {
          return 1; // 첫 번째 날짜가 유효하고, 두 번째 날짜가 유효하지 않으면 두 번째를 앞으로
        } else {
          return new Date(date1) - new Date(date2); // 둘 다 유효하거나 유효하지 않을 때 날짜 순으로 정렬
        }
      },
    );

    return (
      <FlatList
        horizontal
        data={sortedGroupedTasks}
        keyExtractor={([date]) => date}
        renderItem={({item: [date, tasks]}) => {
          // 날짜 유효성 검사
          const isValidDate = moment(date, moment.ISO_8601, true).isValid();

          return (
            <View style={styles.dateSection}>
              <Text
                style={[
                  styles.dateHeaderText,
                  !isValidDate && {paddingBottom: 3},
                ]}>
                {isValidDate ? calculateDaysDifference(date) : '일상'}
              </Text>
              <View style={{flexDirection: 'row'}}>
                {tasks.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.selectedTask,
                      {backgroundColor: theme.complementary[item.color]},
                    ]}
                    onPress={() => handleSelectTask(item)}>
                    <Text style={styles.taskText}>
                      {item.title.slice(0, 4)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        }}
        showsVerticalScrollIndicator={true} // 세로 스크롤바 숨기기
        style={[styles.selectedTasksList]}
      />
    );
  };

  const closeModal = () => {
    onClose(); // 모달을 닫습니다.

    setSelectedTasks(currentTasks => {
      let newTasks = [...currentTasks];

      // selectedDate와 toSchedule 설정 및 _id 제거
      newTasks = newTasks.map(task => {
        const {_id, ...rest} = task; // _id를 제외한 나머지 속성 추출
        return {
          ...rest,
          selectedDate: new Date(date).toISOString(),
          toSchedule: false,
          taskId: _id, // _id를 taskId로 사용
        };
      });

      updateSelectedTasks(newTasks, date);
      return currentTasks;
    });
  };

  // API 요청을 보내는 함수
  const updateSelectedTasks = async (tasks, selectedDate) => {
    try {
      const response = await api.post('/selectedTasks', {
        tasks,
        selectedDate,
      });

      const responseData = response.data;
      updateSelectedTask(responseData.allTasks);
      handleRemovedTasks(responseData.deletedTasks);
    } catch (error) {
      console.error('Error updating tasks:', error.message);
    }
  };

  const handleRemovedTasks = deletedTasks => {
    // tasksToSchedules에서 삭제된 태스크 제거
    // if (removedTasks)

    setTasksToSchedules(currentTasks => {
      return currentTasks?.filter(
        scheduleTask =>
          !deletedTasks.some(
            deletedTask =>
              deletedTask._id === scheduleTask.taskId &&
              moment(deletedTask.selectedDate).format('YYYY-MM-DD') ===
                moment(scheduleTask.targetTime).format('YYYY-MM-DD'),
          ),
      );
    });
  };

  const exitModal = () => {
    onClose(); // 모달을 닫습니다.
  };
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={closeModal}>
      <View style={styles.modal}>
        <View style={[styles.titleContainer, {backgroundColor: theme.third}]}>
          <Text style={styles.title}>할일 채우기</Text>
        </View>
        <View style={styles.modalOver}>
          <TaskMakeSchedule
            schedule={schedules}
            dateString={date}
            startHourOffset={startHourOffset}
            endHourOffset={endHourOffset}
          />
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={exitModal}>
            <View style={[styles.modalLay, {backgroundColor: theme.third}]}>
              <ScrollView style={[styles.modalContent]} horizontal>
                <View style={styles.dateContainer}>
                  <View style={styles.dateTextBox}>
                    <Text style={styles.daliyText}>{'일상'}</Text>
                  </View>
                  {renderInvalidDateTasks()}
                </View>
                {datesWithTasks.map(taskDate => (
                  <View key={taskDate} style={styles.dateContainer}>
                    <View style={styles.dateTextBox}>
                      <Text style={styles.dDayText}>
                        {calculateDaysDifference(taskDate)}
                      </Text>
                      <Text style={styles.dateText}>
                        {formatDateWithDayOfWeek(taskDate)}
                      </Text>
                    </View>
                    {renderTasksForDate(taskDate)}
                  </View>
                ))}
              </ScrollView>
              {selectedTasks.length > 0 && (
                <View style={styles.selectedHeaderBox}>
                  <Text style={styles.selectedHeader}>{'오늘의 할일'}</Text>
                </View>
              )}
              {selectedTasks.length > 0 && renderSelectedTasks()}
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>선택완료</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    // flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalOver: {
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalOverlay: {
    marginTop: 25,
    alignItems: 'center',
  },
  modalLay: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    top: 4,
    width: 240,
    height: 543,
    borderRadius: 20,
    marginRight: 10,
    padding: 15,
  },
  modalContent: {
    width: 220,
    height: 300,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  titleContainer: {
    paddingVertical: 6,
    marginTop: 30,
    width: 240,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateContainer: {
    marginRight: 10,
    padding: 10,
    borderRadius: 12,
    width: 98,
    height: 300,
    backgroundColor: 'white',
  },
  dateTextBox: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dDayText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  daliyText: {
    fontSize: 17,
    paddingVertical: 13,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
    paddingVertical: 5,
    fontWeight: 'bold',
  },
  selectedTaskItem: {
    // 카드에 대한 스타일
    marginVertical: 4,
    borderRadius: 8,
    height: 37,
    width: 77,
    textAlign: 'center',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 2.5,
    // borderColor: '#FF7013',
  },
  taskItem: {
    // 카드에 대한 스타일
    marginVertical: 4,
    borderRadius: 8,
    height: 37,
    width: 77,
    textAlign: 'center',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskText: {
    fontSize: 16,
    color: 'black',
  },
  selectedTaskText: {
    fontSize: 16,
    color: '#0F0F0F',
  },
  closeButton: {
    marginTop: 10,
    // marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: 120,
    height: 40,
    marginLeft: 100,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  selectedTasksList: {
    width: 220,
    paddingLeft: 6,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  selectedTask: {
    marginHorizontal: 4,
    borderRadius: 8,
    height: 37,
    width: 77,
    textAlign: 'center',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateSection: {
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    // alignContent: 'center', // 박스 배경색 변경
  },
  dateHeaderText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
    marginVertical: 2, // 날짜 헤더 텍스트 스타일
  },
  selectedHeader: {fontWeight: 'bold', fontSize: 12},
  selectedHeaderBox: {
    marginTop: 55,
    width: 120,
    height: 35,
    right: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 5,
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
});

export default TaskMakeModal;
