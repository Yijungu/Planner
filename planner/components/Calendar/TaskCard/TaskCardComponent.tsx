import React, {
  useState,
  useImperativeHandle,
  useRef,
  useEffect,
  forwardRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Modal,
  Button,
} from 'react-native';
import {
  PanGestureHandler,
  State,
  GestureHandlerRootView,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import TaskMakeModal from '../../../modal/TaskMakeModal';
import {useDragDrop} from '../../../state/DragDropContext';
import moment from 'moment';
import {useColor} from '../../../state/ColorContext';
import api from '../../../utils/api';
import {useSchedules} from '../../../state/ScheduleContext';
import CustomSwitch from '../../Switch';

const TaskCardComponent = forwardRef(
  (
    {
      schedules,
      tasks,
      dateString,
      handleDrop,
      selectedTasks,
      setSelectedTasks,
      setTasksToSchedules,
      startHourOffset,
      endHourOffset,
    },
    ref,
  ) => {
    const {setTasks} = useSchedules();
    const {theme} = useColor();
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [selectedFilteredTasks, setSelectedFilteredTasks] = useState([]);
    const [selectedNonVisibleTasks, setSelectedNonVisibleTasks] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const {handleDragEnd, handleDragStart, dragging, draggedItem} =
      useDragDrop();
    const [startTranslation, setStartTranslation] = useState({x: 0, y: 0});
    const translations = useRef({});
    const viewRef = useRef<View>(null);
    const [componentWidth, setComponentWidth] = useState(0);
    const [noTasksMessageVisible, setNoTasksMessageVisible] = useState(false);
    const [clickedItems, setClickedItems] = useState([]);
    const [nextSelectedDate, setNextSelectedDate] = useState(
      moment(new Date()).tz('Asia/Seoul').format('YYYY-MM-DD'),
    );
    const [selectButtonBool, setSelectButtonBool] = useState(true);
    const [zIndex, setZIndex] = useState(0);
    const [currentTask, setCurrentTask] = useState(null);
    const [optionModalVisible, setOptionModalVisible] = useState(false);

    useEffect(() => {
      console.log(1111);
      if (filteredTasks.length > 0) {
        const updatedItems = filteredTasks.filter(t => t.done === true);
        setClickedItems(updatedItems);
      } else {
        setClickedItems([]);
      }
    }, [filteredTasks]);

    useEffect(() => {
      // 오늘 날짜를 가져옵니다.
      const today = moment().startOf('day');
      const date = moment(dateString).startOf('day');

      let nextSelectedDate;

      if (date.isBefore(today)) {
        // dateString이 오늘보다 낮으면 오늘로 설정
        nextSelectedDate = today;
        setSelectButtonBool(true);
      } else if (date.isSame(today)) {
        // dateString이 오늘과 같으면 내일로 설정
        nextSelectedDate = today.clone().add(1, 'day');
        setSelectButtonBool(true);
      } else {
        // dateString이 오늘보다 높으면 내일로 설정
        nextSelectedDate = today.clone().add(1, 'day');
        setSelectButtonBool(false);
      }

      // nextSelectedDate를 설정합니다.
      setNextSelectedDate(nextSelectedDate.format('YYYY-MM-DD'));
    }, [dateString, setNextSelectedDate]);

    useEffect(() => {
      const relevantDates = tasks
        .filter(task => new Date(task.dueDate) >= new Date(dateString))
        .map(task => task.dueDate.split('T')[0]);
      // 중복을 제거하고 정렬
      const uniqueDates = Array.from(new Set(relevantDates)).sort();
      // 할일이 없으면 메시지를 표시합니다.
      setNoTasksMessageVisible(uniqueDates.length === 0);
    }, [tasks, dateString]);

    useEffect(() => {
      if (selectedTasks) {
        // 날짜 기준으로 정렬된 태스크 목록 생성
        const tasksForDate = selectedTasks
          .filter(
            task =>
              moment(task.selectedDate).format('YYYY-MM-DD') === dateString,
          )
          .sort((a, b) => {
            const dateA = moment(a.dueDate).isValid()
              ? moment(a.dueDate)
              : null;
            const dateB = moment(b.dueDate).isValid()
              ? moment(b.dueDate)
              : null;

            if (!dateA) return -1; // a가 "Invalid date"인 경우
            if (!dateB) return 1; // b가 "Invalid date"인 경우
            return dateA.diff(dateB); // 두 날짜가 모두 유효한 경우 비교
          });

        // clickedItems에 포함된 태스크를 제외한 목록 생성

        // 최종 목록 생성: nonClickedTasks + clickedTasks

        setFilteredTasks(tasksForDate);
        console.log(tasksForDate);
        const matchedTasks = tasks.filter(task =>
          tasksForDate.some(t => t.taskId === task._id && t.done === false),
        );

        const nonVisibleTasks = tasks.filter(task =>
          selectedTasks.some(t => t.taskId === task._id && t.done === true),
        );
        setSelectedFilteredTasks(matchedTasks);
        setSelectedNonVisibleTasks(nonVisibleTasks);
      }
    }, [selectedTasks, dateString]);

    useEffect(() => {
      // 새로운 아이템에 대해서만 Animated.ValueXY를 생성합니다.
      selectedTasks.forEach(item => {
        if (!translations.current[item._id]) {
          // 아직 Animated.ValueXY가 생성되지 않았으면 새로 생성합니다.
          translations.current[item._id] = new Animated.ValueXY();
        }
      });
    }, [selectedTasks]);

    useImperativeHandle(ref, () => ({
      measure: callback => {
        viewRef.current?.measure((x, y, width, height, pageX, pageY) => {
          callback({x, y, width, height, pageX, pageY});
        });
      },
    }));

    const onLayout = event => {
      const {width} = event.nativeEvent.layout;
      setComponentWidth(width);
    };

    const handleOpenModal = () => {
      setModalVisible(true);
    };

    const handleCloseModal = () => {
      setModalVisible(false);
    };

    const handleItemPress = (item, isSpecialGroup, date) => {
      if (!isSpecialGroup) {
        setClickedItems([...clickedItems, {...item, done: true}]);

        // setSelectedTasks를 이용하여 같은 _id를 가진 항목의 item.done을 true로 변경
        setSelectedTasks(prevTasks =>
          prevTasks.map(t => (t._id === item._id ? {...t, done: true} : t)),
        );

        toggleDone(item._id);
      } else if (date === '완료된 작업') {
      } else if (date === '미완료 작업') {
        setCurrentTask(item);
        setOptionModalVisible(true);
      }
    };

    const startDrag = (item, nativeEvent) => {
      // 드래그 시작 위치를 초기화합니다.

      const startX = nativeEvent.absoluteX - 300;
      const startY = nativeEvent.absoluteY - 145;
      setStartTranslation({x: startX, y: startY});
      setZIndex(1);
      translations.current[item._id].x.setValue(0);
      translations.current[item._id].y.setValue(0);
      handleDragStart(item);
    };

    const endDrag = (item, nativeEvent) => {
      // 드래그가 끝난 후의 translation 값으로 드롭 지점 계산
      const dropX = 254 + startTranslation.x + nativeEvent.translationX;
      const dropY = startTranslation.y + nativeEvent.translationY;
      setZIndex(0);
      translations.current[item._id].x.setValue(0);
      translations.current[item._id].y.setValue(0);
      handleDrop(item, dropX, dropY);
      handleDragEnd();
    };

    const selectedTasksDoneRecall = async item => {
      const updatedItems = clickedItems.filter(t => t._id !== item._id);
      setClickedItems(updatedItems);

      // setSelectedTasks를 이용하여 같은 _id를 가진 항목의 item.done을 true로 변경
      setSelectedTasks(prevTasks =>
        prevTasks.map(t => (t._id === item._id ? {...t, done: false} : t)),
      );

      toggleDone(item._id);
    };

    const selectedTasksFinish = async item => {
      try {
        const response = await api.patch('/selectedTasks/finish', {
          selectedTask: item,
        });

        if (response.status === 200) {
          console.log('Task updated successfully:');
          setSelectedTasks(response.data.allSelectedTasks);
          setTasks(response.data.allTasks);
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

    const toggleDone = async taskId => {
      try {
        const response = await api.patch(
          `/selectedTasks/toggle/done/${taskId}`,
        );

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

    // setSelectedTasks(currentTasks => {
    //   return currentTasks.map(task => {
    //     // item.taskId와 task의 _id가 같다면, toSchedule을 false로 설정
    //     if (task._id === item._id) {
    //       return {...task, toSchedule: true};
    //     }
    //     // 다른 경우에는 task를 변경 없이 반환
    //     return task;
    //   });
    // });

    // setTasksToSchedules(storedTasksToSchedules);
    // setTotalSchedules([...schedule, ...tasksToSchedules]);

    const renderGroupedTasks = () => {
      // 날짜별로 작업을 그룹화
      const groupedTasks = filteredTasks.reduce((acc, task) => {
        const date = moment(task.dueDate).isValid()
          ? task.dueDate.split('T')[0]
          : 'Invalid date';
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(task);
        return acc;
      }, {});

      // 날짜 키를 사용하여 그룹화된 작업을 배열로 변환하고 정렬
      const sortedGroupedTasks = Object.entries(groupedTasks).sort(
        ([date1], [date2]) => {
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

      const calculateDaysDifference = date => {
        const startDate = moment(dateString);
        const endDate = moment(date);
        const daysDiff = endDate.diff(startDate, 'days');
        return daysDiff > 0 ? `D-${daysDiff}` : `D+${Math.abs(daysDiff)}`;
      };

      // 클릭되지 않은 작업과 클릭된 작업을 구분
      const unclickedInvalidTasks = sortedGroupedTasks
        .filter(([date]) => !moment(date, moment.ISO_8601, true).isValid())
        .map(([date, tasks]) => [
          date,
          tasks.filter(task => !clickedItems.some(t => t._id === task._id)),
        ])
        .filter(([date, tasks]) => tasks.length > 0);

      const unclickedValidTasks = sortedGroupedTasks
        .filter(([date]) => moment(date, moment.ISO_8601, true).isValid())
        .map(([date, tasks]) => [
          date,
          tasks.filter(task => !clickedItems.some(t => t._id === task._id)),
        ])
        .filter(([date, tasks]) => tasks.length > 0);

      // 클릭된 작업 중에서 done 상태에 따라 구분
      const clickedUndoneTasks = clickedItems.filter(task => !task.finish);
      const clickedDoneTasks = clickedItems.filter(task => task.finish);

      const finalGroupedTasks = [
        ...unclickedInvalidTasks,
        ...unclickedValidTasks,
      ];

      if (clickedUndoneTasks.length > 0) {
        const groupedClickedUndoneTasks = ['미완료 작업', clickedUndoneTasks];

        finalGroupedTasks.push(groupedClickedUndoneTasks);
      }
      if (clickedDoneTasks.length > 0) {
        const groupedClickedDoneTasks = ['완료된 작업', clickedDoneTasks];
        finalGroupedTasks.push(groupedClickedDoneTasks);
      }

      // Rendered List
      return (
        <FlatList
          data={finalGroupedTasks}
          keyExtractor={([date]) => date}
          renderItem={({item: [date, tasks]}) => {
            const isSpecialGroup =
              date === '완료된 작업' || date === '미완료 작업';

            return (
              <View style={styles.dateSection}>
                <Text style={styles.dateHeaderText}>
                  {date === '완료된 작업'
                    ? '완료'
                    : date === '미완료 작업'
                    ? '' // 세 번째 그룹은 아무것도 표시하지 않음
                    : moment(date, moment.ISO_8601, true).isValid()
                    ? calculateDaysDifference(date)
                    : '일상'}
                </Text>
                <View style={{flexWrap: 'wrap'}}>
                  {tasks.map(item => (
                    <GestureHandlerRootView key={item._id}>
                      <TapGestureHandler
                        onHandlerStateChange={({nativeEvent}) => {
                          if (nativeEvent.state === State.ACTIVE) {
                            handleItemPress(item, isSpecialGroup, date);
                          }
                        }}>
                        {isSpecialGroup ? (
                          <View
                            style={[
                              styles.itemContainer,
                              {
                                backgroundColor: clickedItems.some(
                                  t => t._id === item._id,
                                )
                                  ? '#A9A9A9' // 클릭된 아이템은 회색 배경
                                  : theme.complementary[item.color],
                              },
                            ]}>
                            <Text style={styles.itemText}>
                              {item.title.slice(0, 6)}
                            </Text>
                          </View>
                        ) : (
                          <PanGestureHandler
                            onGestureEvent={Animated.event(
                              [
                                {
                                  nativeEvent: {
                                    translationX:
                                      translations.current[item._id].x,
                                    translationY:
                                      translations.current[item._id].y,
                                  },
                                },
                              ],
                              {useNativeDriver: false},
                            )}
                            onHandlerStateChange={({nativeEvent}) => {
                              if (clickedItems.some(t => t._id === item._id)) {
                                return; // 클릭된 아이템이면 드래그 차단
                              }
                              if (nativeEvent.state === State.ACTIVE) {
                                startDrag(item, nativeEvent);
                              } else if (nativeEvent.state === State.END) {
                                endDrag(item, nativeEvent);
                              }
                            }}>
                            <Animated.View
                              style={[
                                styles.itemContainer,
                                {
                                  backgroundColor: clickedItems.some(
                                    t => t._id === item._id,
                                  )
                                    ? '#A9A9A9' // 클릭된 아이템은 회색 배경
                                    : draggedItem?._id === item._id
                                    ? 'transparent'
                                    : theme.complementary[item.color],
                                  transform:
                                    translations.current[
                                      item._id
                                    ].getTranslateTransform(),
                                },
                              ]}>
                              <Text style={styles.itemText}>
                                {item.title.slice(0, 6)}
                              </Text>
                            </Animated.View>
                          </PanGestureHandler>
                        )}
                      </TapGestureHandler>
                    </GestureHandlerRootView>
                  ))}
                </View>
                <Modal
                  visible={optionModalVisible}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setOptionModalVisible(false)}>
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                      <Text style={styles.modalTitle}>선택하세요</Text>
                      <View style={styles.modalButtonContainer}>
                        <Button
                          title="되돌리기"
                          onPress={() => {
                            selectedTasksDoneRecall(currentTask);
                            setOptionModalVisible(false);
                          }}
                        />
                        <Button
                          title="완료"
                          onPress={() => {
                            selectedTasksFinish(currentTask);
                            setOptionModalVisible(false);
                          }}
                        />
                      </View>
                    </View>
                  </View>
                </Modal>
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
        />
      );
    };

    return (
      <View
        ref={viewRef}
        style={[styles.background, {zIndex}]}
        onLayout={onLayout}>
        <TouchableOpacity style={styles.addButton} onPress={handleOpenModal}>
          <Text style={styles.addCardTextKr}>수정</Text>
        </TouchableOpacity>
        <View style={styles.flatListBox}>{renderGroupedTasks()}</View>

        <TaskMakeModal
          schedules={schedules}
          date={dateString}
          onClose={handleCloseModal}
          updateSelectedTask={setSelectedTasks}
          visible={modalVisible}
          setTasksToSchedules={setTasksToSchedules}
          selectedInputTasks={selectedFilteredTasks}
          selectedNonVisibleTasks={selectedNonVisibleTasks}
          startHourOffset={startHourOffset}
          endHourOffset={endHourOffset}
        />
        {dragging && draggedItem && draggedItem.toSchedule === false && (
          <Animated.View
            style={[
              styles.draggedItemContainer,
              {
                transform: [
                  {
                    translateX: Animated.add(
                      startTranslation.x,
                      translations.current[draggedItem._id].x,
                    ),
                  },
                  {
                    translateY: Animated.add(
                      startTranslation.y,
                      translations.current[draggedItem._id].y,
                    ),
                  },
                ],
                backgroundColor: theme.complementary[draggedItem.color],
              },
            ]}>
            <Text style={styles.itemText}>{draggedItem.title.slice(0, 6)}</Text>
          </Animated.View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  background: {
    marginTop: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minWidth: 60,
    height: 600,
  },
  dateSection: {
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: '#F2F2F2',
    paddingBottom: 5,
  },
  dateHeaderText: {
    marginLeft: 10,
    marginTop: 4,
  },
  flatListBox: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    marginTop: 30,
    padding: 5,
    minHeight: 200,
    backgroundColor: '#F2F2F2',
  },
  container: {},
  card: {
    padding: 15,
    marginHorizontal: 30,
    borderRadius: 8,
  },
  title: {
    color: '#FFF6F6',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    fontSize: 16,
    width: '100%',
  },
  button: {
    backgroundColor: '#E9EEFF',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingRight: 3,
    paddingLeft: 5,
    paddingVertical: 10,
    height: 100,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#606060',
    fontWeight: 'bold',
    fontSize: 12,
    width: 15,
  },
  buttonArrow: {
    color: '#606060',
    fontWeight: 'bold',
    fontSize: 15,
    width: 15,
  },
  addButton: {
    position: 'absolute',
    right: 10,
    backgroundColor: '#F3EFEF',
    borderRadius: 8,
    width: 45,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardT: {
    width: 15,
    height: 15,
    bottom: 4,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCardText: {
    left: 0.5,
    bottom: 1,
    borderRadius: 30,
    color: 'white',
  },
  addCardTextKr: {
    fontSize: 11,
    borderRadius: 30,
    color: '#0A0908',
  },
  itemContainer: {
    marginHorizontal: 8,
    marginTop: 8,
    borderRadius: 8,
    width: 95,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draggedItemContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 95,
    height: 45,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    // zIndex: 9999, // 최상단에 있도록 설정
  },
  itemText: {
    color: '#fff',
    marginHorizontal: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default TaskCardComponent;
