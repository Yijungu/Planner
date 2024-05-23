// ScheduleModal.js
import React, {useState, useRef, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Button,
  Animated,
  InputAccessoryView,
} from 'react-native';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CalenderTaskComponent from './CalenderTaskModal';
import 'moment/locale/ko'; // 한국어 로케일을 임포트
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useSchedules} from '../../state/ScheduleContext';
import 'moment-timezone';
import 'moment/locale/ko';
import {useColor} from '../../state/ColorContext';
import api from '../../utils/api';
import CalendarWriteModal from './CalendarWriteModal';

moment.locale('ko'); // 전역 설정으로 한국어 로케일을 사용

const ScheduleModal = ({
  isVisible,
  onClose,
  schedule,
  tasks,
  date,
  onUpdateSchedules,
  onUpdateTasks,
}) => {
  const {theme} = useColor();
  const {
    schedules,
    setSchedules,
    setTasksToSchedules,
    tasksToSchedules,
    setSelectedTasks,
    selectedTasks,
    addScheduleAndRemoveOverlapping,
  } = useSchedules();
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isDragging, setIsDragging] = useState(false);
  const hourHeight = 60;
  const [scrollOffset, setScrollOffset] = useState(0);
  const [start, setStart] = useState(0);
  const [formattedDate, setFormattedDate] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [localSchedules, setLocalSchedules] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [repeatSchedule, setRepeatSchedule] = useState(false);
  const [taskInputBool, setTaskInputBool] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const inputRef = useRef(null);
  const animValue = useRef(new Animated.Value(0)).current; // 애니메이션 값
  const complementaryColors = theme.complementary || {};
  const firstComplementaryColorKey = Object.keys(complementaryColors)[0];
  const [selectedColorKey, setSelectedColorKey] = useState(
    firstComplementaryColorKey || 'fourth',
  );

  const fadeIn = () => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = () => {
    Animated.timing(animValue, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setTaskInputBool(false); // 애니메이션 완료 후 상태 업데이트
    });
  };

  useEffect(() => {
    if (taskInputBool) {
      fadeIn();
    } else {
      fadeOut();
    }
  }, [taskInputBool]);

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0], // 위에서 아래로
  });

  useEffect(() => {
    setLocalSchedules(schedule);
  }, [schedule]);

  useEffect(() => {
    // 모달이 열릴 때 스크롤 위치를 초기화하여 8시로 맞춤
    if (isVisible) {
      setTimeout(() => {
        setScrollOffset(8 * hourHeight); // 8시로 맞추기 위해 스크롤 위치를 설정
        scrollViewRef.current?.scrollTo({y: 8 * hourHeight, animated: true});
      }, 100); // 100ms 후에 스크롤 조정을 시작합니다.
    }
  }, [isVisible]);

  useEffect(() => {
    // isVisible이 true일 때만 formatDateDisplay를 호출합니다.

    if (isVisible) {
      setFormattedDate(formatDateDisplay(date));
    }
  }, [isVisible, date]);

  const handleInputBlur = () => {
    if (inputRef.current && taskInput === '') {
      fadeOut();
    }
  };

  const formatToKoreanTime = isoDateString => {
    moment.locale('ko');
    const koreanTime = moment(isoDateString).tz('Asia/Seoul');
    return koreanTime.format('A h시 m분'); // "오후 ~시 ~분" format
  };

  const formatToKoreanTimeEnd = isoDateString => {
    moment.locale('ko');
    const koreanTime = moment(isoDateString).tz('Asia/Seoul');
    return koreanTime.format('h시 m분');
  };

  const handleScroll = e => {
    setScrollOffset(e.nativeEvent.contentOffset.y); // 스크롤 위치 설정
  };

  // 길게 누르기 이벤트 핸들러
  const handleLongPress = hour => e => {
    // 현재 ScrollView의 스크롤 위치를 가져옵니다.
    setStart(hour * hourHeight + 30);
    // start = hour * hourHeight + scrollOffset - 30;
    setDragStart(start);
    setDragEnd(start);
    setIsDragging(true);
    scrollViewRef.current.setNativeProps({scrollEnabled: false});
  };

  // 드래그 동작 중 영역 선택
  const handleMove = e => {
    if (isDragging) {
      // scrollViewRef.current.setNativeProps({scrollEnabled: true});
      const startY = e.nativeEvent.pageY;
      setDragEnd(startY - 110 + scrollOffset);
    }
  };
  const triggerScrollUpdate = () => {
    if (scrollViewRef.current) {
      const currentOffset = scrollOffset;
      // 스크롤을 현재 위치에서 조금 위로 올렸다가 다시 원래 위치로 복귀
      scrollViewRef.current.scrollTo({y: currentOffset - 1, animated: false});
      setTimeout(() => {
        scrollViewRef.current.scrollTo({y: currentOffset, animated: false});
      }, 10); // 10밀리초 후에 원래 위치로 복귀
    }
  };

  // 드래그 종료 후 처리
  const handleRelease = async () => {
    if (isDragging) {
      setIsDragging(false);
      scrollViewRef.current.setNativeProps({scrollEnabled: true});
      setIsModalVisible(true);
      const startHour = Math.floor(dragStart / hourHeight);
      const startMinutes =
        Math.floor((dragStart % hourHeight) / (hourHeight / 4)) * 15 - 30;
      const endHour = Math.floor(dragEnd / hourHeight);
      let endMinutes =
        Math.floor((dragEnd % hourHeight) / (hourHeight / 4)) * 15;
      endMinutes = endHour <= startHour ? endMinutes - 15 : endMinutes - 30;

      let newStartDate = new Date(date);
      newStartDate.setHours(startHour, startMinutes, 0, 0);
      let newEndDate = new Date(date);
      newEndDate.setHours(endHour, endMinutes, 0, 0);
      if (newStartDate > newEndDate) {
        [newStartDate, newEndDate] = [newEndDate, newStartDate]; // 두 날짜의 값을 서로 바꿈
      }
      setStartDate(newStartDate);
      setEndDate(newEndDate);
    }
  };

  const handleSaveEvent = async () => {
    setIsModalVisible(false);
    const accessToken = await AsyncStorage.getItem('accessToken');

    const newSchedule = {
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      event: eventTitle, // 이벤트 이름은 변경 가능
      color: selectedColorKey,
    };

    try {
      const response = await api.post(`/schedules`, newSchedule);
      const addedSchedule = response.data;

      const storedSchedulesString = await AsyncStorage.getItem('schedules');
      let storedSchedules = storedSchedulesString
        ? JSON.parse(storedSchedulesString)
        : [];

      storedSchedules.push(addedSchedule);
      await AsyncStorage.setItem('schedules', JSON.stringify(storedSchedules));
      setSchedules(storedSchedules);
      onUpdateSchedules(addedSchedule);
      localSchedules.push(addedSchedule);

      const resultArray = await addScheduleAndRemoveOverlapping(addedSchedule);
      setTasksToSchedules(resultArray.filteredTasksToSchedules);

      const updatedSelectedTasks = await updateSelectedTasks(
        resultArray.overlappingTasks,
      );
      await AsyncStorage.setItem(
        'tasksToSchedules',
        JSON.stringify(resultArray.filteredTasksToSchedules),
      );
      await AsyncStorage.setItem(
        'selectedTasks',
        JSON.stringify(updatedSelectedTasks),
      );

      if (taskInput.length > 0) {
        await handleComplete(repeatSchedule);
      }

      if (repeatSchedule) {
        await createWeeklySchedules();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleComplete = async repeatSchedule => {
    const accessToken = await AsyncStorage.getItem('accessToken');

    const newTask = {
      title: taskInput,
      dueDate: startDate ? new Date(startDate).toISOString() : null,
      color: 'primary', // 예시 색상
      deleteOption: repeatSchedule ? 'delay' : 'immediate',
    };

    try {
      const response = await api.post('/tasks', newTask);
      const addedTask = response.data;

      onUpdateTasks(addedTask);

      const storedTasksString = await AsyncStorage.getItem('tasks');
      let storedTasks = storedTasksString ? JSON.parse(storedTasksString) : [];
      storedTasks.push(addedTask);
      await AsyncStorage.setItem('tasks', JSON.stringify(storedTasks));

      onModalClose();
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to create task due to network error');
    }
  };

  const createWeeklySchedules = async () => {
    const schedules = [];
    let currentDate = moment(startDate).add(1, 'week').toDate(); // 첫 번째 항목을 건너뛰고 시작
    let currentEndDate = moment(endDate).add(1, 'week').toDate(); // 첫 번째 항목을 건너뛰고 시작
    const endMonth = moment().add(3, 'months').toDate();

    while (currentDate <= endMonth) {
      const newSchedule = {
        startTime: new Date(currentDate).toISOString(),
        endTime: new Date(currentEndDate).toISOString(),
        event: eventTitle,
        color: 'primary',
      };
      schedules.push(newSchedule);

      currentDate = moment(currentDate).add(1, 'week').toDate();
      currentEndDate = moment(currentEndDate).add(1, 'week').toDate();
    }

    try {
      const response = await api.post(`/schedules/bulk`, schedules);
      const addedSchedules = response.data;

      const storedSchedulesString = await AsyncStorage.getItem('schedules');
      let storedSchedules = storedSchedulesString
        ? JSON.parse(storedSchedulesString)
        : [];
      storedSchedules = [...storedSchedules, ...addedSchedules];
      await AsyncStorage.setItem('schedules', JSON.stringify(storedSchedules));
      setSchedules(storedSchedules);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert(
        'Error',
        'Failed to create weekly schedules due to network error',
      );
    }
  };

  const onModalClose = () => {
    setEventTitle('');
    setTaskInput('');
    onClose();
  };

  const updateSelectedTasks = async overlappingTasks => {
    return new Promise(resolve => {
      setSelectedTasks(currentTasks => {
        const updatedTasks = currentTasks.map(current => {
          const taskToUpdate = overlappingTasks.find(
            t => t.taskId === current._id,
          );
          return taskToUpdate ? {...current, toSchedule: false} : current;
        });
        resolve(updatedTasks); // 업데이트된 상태를 Promise에 반환
        return updatedTasks;
      });
    });
  };
  const HourRow = React.memo(({hour, onLongPress}) => {
    return (
      <TouchableOpacity onLongPress={onLongPress(hour)}>
        <View style={styles.hourRow}>
          <Text style={styles.hourText}>{`${hour}`}</Text>
          <View style={styles.line} />
        </View>
      </TouchableOpacity>
    );
  });

  const renderHourRows = () => {
    return Array.from({length: 24}, (_, i) => (
      <HourRow key={i} hour={i} onLongPress={handleLongPress} />
    ));
  };

  const renderSelectionArea = () => {
    if (!isDragging || dragStart === null || dragEnd === null) {
      return null;
    }
    const height = Math.floor(Math.abs(dragEnd - dragStart) / 15) * 15;

    if (dragStart > dragEnd) {
      const top = Math.ceil(dragEnd / 15) * 15;
      return (
        <View
          style={{
            position: 'absolute',
            left: 35,
            right: 20,
            top,
            height,
            backgroundColor: 'rgba(0, 0, 255, 0.2)',
          }}
        />
      );
    } else {
      const top = dragStart;
      return (
        <View
          style={{
            position: 'absolute',
            left: 35,
            right: 20,
            top,
            height,
            backgroundColor: 'rgba(0, 0, 255, 0.2)',
          }}
        />
      );
    }
  };

  const formatDateDisplay = date => {
    return moment(date).locale('ko').format('MMMM Do (ddd)');
    // 한국어 설정을 각 호출에 적용
  };

  const renderRightActions = (progress, dragX, item) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [0, 0, 0, 1],
    });
    return (
      <TouchableOpacity
        onPress={() => handleRemove(item._id)}
        style={styles.deleteButton}
        activeOpacity={0.6} // 버튼을 눌렀을 때의 피드백을 위해 투명도 조절
      >
        <Animated.View
          style={[
            styles.deleteBox,
            {
              transform: [{translateX: trans}],
            },
          ]}
          // useNativeDriver={true} // 네이티브 드라이버 사용으로 성능 향상
        >
          <Text style={styles.deleteText}>+</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const handleItemClick = e => {
    e.stopPropagation();
  };

  // 스케줄 아이템을 렌더링하는 함수
  const renderScheduleItems = () => {
    return localSchedules.map((item, index) => {
      const startMoment = moment(item.startTime);
      const endMoment = moment(item.endTime);
      const topOffset = startMoment.hour() * hourHeight + 30;
      const height = (endMoment.hour() - startMoment.hour()) * hourHeight;

      return (
        <GestureHandlerRootView
          style={[styles.gestureBox, {top: topOffset, height}]}>
          <Swipeable
            key={`${item.id}-${index}`}
            renderRightActions={(progress, dragX) =>
              renderRightActions(progress, dragX, item)
            }
            friction={1} // 스와이프 동작 중 이동에 필요한 힘의 양을 늘림
            overshootFriction={20}>
            <TouchableOpacity
              style={[
                styles.event,
                {height, backgroundColor: theme.complementary[item.color]},
              ]}
              activeOpacity={1}
              onPress={handleItemClick}>
              <Text style={styles.eventText}>{item.event.slice(0, 8)}</Text>
            </TouchableOpacity>
          </Swipeable>
        </GestureHandlerRootView>
      );
    });
  };

  const handleRemove = scheduleId => {
    deleteSchedule(scheduleId);
  };
  const clearInput = () => {
    setEventTitle('');
  };
  // 서버로 DELETE 요청을 보내는 deleteSchedule 함수
  const deleteSchedule = async scheduleId => {
    try {
      const response = await api.delete(`/schedules/${scheduleId}`);

      if (response.status !== 200) {
        throw new Error('Error deleting schedule');
      }

      // 로컬 상태 업데이트
      const newSchedules = schedules.filter(
        schedule => schedule._id !== scheduleId,
      );
      setSchedules(newSchedules);
      await AsyncStorage.setItem('schedules', JSON.stringify(newSchedules));

      const newLocalSchedules = localSchedules.filter(
        schedule => schedule._id !== scheduleId,
      );
      setLocalSchedules(newLocalSchedules);
    } catch (error) {
      console.error('There was an error deleting the schedule', error);
      // 오류가 발생하면 사용자에게 알림 처리가 필요할 수 있음
    }
  };

  const onCloseModal = () => {
    setEventTitle('');
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onCloseModal}>
        <View style={styles.modalDate}>
          <Text style={styles.modalDateText}>{formattedDate}</Text>
        </View>
        <View style={styles.modalContainer}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scheduleContainer}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onMoveShouldSetResponder={() => true}
            onResponderMove={handleMove}
            onResponderRelease={handleRelease}>
            {renderHourRows()}
            {renderScheduleItems()}
            {renderSelectionArea()}
          </ScrollView>
          <Modal
            animationType="fade"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setIsModalVisible(!isModalVisible)}>
            <TouchableOpacity
              style={styles.modalEntireView}
              activeOpacity={1}
              onPressOut={() => setIsModalVisible(false)}>
              <View style={[styles.modalView, {backgroundColor: theme.third}]}>
                <View style={styles.inputView}>
                  <Text style={styles.scheduleAddModalText}>
                    {formattedDate}
                  </Text>
                  <Text style={styles.scheduleAddModalText}>
                    {formatToKoreanTime(startDate)} ~{' '}
                    {formatToKoreanTimeEnd(endDate)} 일정
                  </Text>
                </View>

                <View style={styles.inputView}>
                  <TextInput
                    style={[styles.input, {backgroundColor: theme.fifth}]}
                    placeholder="일정을 입력하세요"
                    value={eventTitle}
                    onChangeText={setEventTitle}
                    onSubmitEditing={handleSaveEvent} // 엔터를 누를 때 handleComplete 함수 실행
                    returnKeyType="done"
                    autoFocus={true} // 키보드에 완료 버튼을 'Done'으로 표시
                  />
                  {eventTitle.length > 0 && (
                    <TouchableOpacity
                      onPress={clearInput}
                      style={styles.clearButton}>
                      <Text style={styles.clearButtonText}>+</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.scheduleButtonBox}>
                  <View style={styles.colorPicker}>
                    {Object.keys(complementaryColors).map(key => (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.colorOption,
                          selectedColorKey === key
                            ? {borderColor: theme.primary, borderWidth: 2}
                            : {},
                        ]}
                        onPress={() => setSelectedColorKey(key)}>
                        <View
                          style={[
                            styles.colorCircle,
                            {backgroundColor: complementaryColors[key]},
                          ]}
                        />
                        <Text style={styles.colorText}>{key}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.scheduleTypeBox}>
                    <TouchableOpacity
                      style={{
                        ...styles.scheduleTypeButton,
                        ...(repeatSchedule
                          ? {backgroundColor: '#F9F4EE'}
                          : {backgroundColor: theme.third}),
                      }}
                      onPress={() => setRepeatSchedule(false)}>
                      <Text style={styles.scheduleTypeButtonText}>
                        {'하루'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        ...styles.scheduleTypeButton,
                        ...(repeatSchedule
                          ? {backgroundColor: theme.third}
                          : {backgroundColor: '#F9F4EE'}),
                      }}
                      onPress={() => setRepeatSchedule(true)}>
                      <Text style={styles.scheduleTypeButtonText}>
                        {'매주'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {!taskInputBool && (
                    <TouchableOpacity
                      style={[
                        styles.taskButton,
                        {backgroundColor: theme.secondary},
                      ]}
                      activeOpacity={1}
                      onPress={() => {
                        setTaskInputBool(true);
                      }}>
                      <Text style={styles.scheduleTypeButtonText}>
                        할일 추가하기
                      </Text>
                    </TouchableOpacity>
                  )}
                  {taskInputBool && (
                    <Animated.View
                      style={[
                        styles.taskButton,
                        {opacity: animValue, transform: [{translateY}]},
                      ]}>
                      <TextInput
                        ref={inputRef}
                        autoFocus={true}
                        onBlur={handleInputBlur}
                        onChangeText={setTaskInput}
                        onSubmitEditing={handleSaveEvent}
                        returnKeyType="done"
                      />
                    </Animated.View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
          <CalenderTaskComponent
            task={tasks}
            date={date}
            onUpdateTasks={onUpdateTasks}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingBottom: 10,
  },
  modalDate: {
    backgroundColor: '#FFFFFF',
    margin: 10,
    padding: 5,
    borderRadius: 10,
  },
  modalDateText: {
    fontSize: 18,
    paddingHorizontal: 5,
  },
  modalContainer: {
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',

    width: '88%',
    height: '75%',
  },
  scheduleContainer: {
    borderRadius: 10,
    width: '50%',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  taskContainer: {
    borderRadius: 10,
    width: '50%',
    marginLeft: 8,
    backgroundColor: '#fff',
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    // borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  hourText: {
    marginHorizontal: 15,
    // width: 20,
    textAlign: 'right',
    color: '#333',
  },
  line: {
    flex: 1,
    height: 1,
    marginRight: 10,
    backgroundColor: '#e1e1e1',
  },
  gestureBox: {
    position: 'absolute',
    left: 9,
    width: 230,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  event: {
    width: 170,
    borderRadius: 5,
    padding: 8,
    elevation: 3,
    shadowOffset: {width: 1, height: 1},
    shadowColor: '#333',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventText: {
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 8,
    elevation: 3,
    shadowOffset: {width: 1, height: 1},
    shadowColor: '#333',
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  closeButtonText: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 16,
  },
  modalEntireView: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  modalView: {
    position: 'absolute',
    width: '90%',
    bottom: '50%',
    margin: 20,
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  textInput: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '80%', // Set width as needed
  },
  deleteButton: {
    padding: 10, // 추가 패딩으로 터치 영역 확장
    backgroundColor: '#F9F4EE', // 눈에 띄는 배경색 추가
    borderRadius: 5, // 모서리 둥글게 처리
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBox: {
    width: 13,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(60, 60, 67, 0.6)', // 취향에 맞게 색상 조절
    borderRadius: 20, // 원형 버튼을 만들기 위함
    marginHorizontal: 10,
  },
  deleteText: {
    left: 0.5,
    color: 'white', // 취향에 맞게 색상 조절
    fontSize: 10,
    transform: [{rotate: '45deg'}], // 회전 적용
  },
  scheduleAddModalText: {
    fontSize: 16,
    margin: 3,
    fontWeight: 'bold',
    paddingLeft: 10,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    height: 13,
    width: 13,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(60, 60, 67, 0.6)', // 취향에 맞게 색상 조절
    borderRadius: 20, // 원형 버튼을 만들기 위함
    marginVertical: 10,
  },
  clearButtonText: {
    left: 0.5,
    color: 'white', // 취향에 맞게 색상 조절
    fontSize: 10,
    transform: [{rotate: '45deg'}], // 회전 적용
  },
  inputView: {
    justifyContent: 'center',
    width: '100%',
  },
  input: {
    padding: 10,
    marginVertical: 10,
    borderRadius: 10,
  },
  scheduleButtonBox: {
    width: '100%',
    // flexDirection: 'row',
    // justifyContent: 'space-between',
  },
  scheduleTypeBox: {
    width: '28%',
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: '#F9F4EE',
  },
  taskButton: {
    width: '68%',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 10,
    backgroundColor: '#F9F4EE',
    alignContent: 'center',
    borderRadius: 10,
  },
  scheduleTypeButtonText: {
    color: '#101010',
  },
  scheduleTypeButton: {
    borderRadius: 7,
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    width: '80%',
  },
  colorOption: {
    alignItems: 'center',
    padding: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  colorCircle: {
    width: 10,
    height: 10,
    borderRadius: 10,
    marginBottom: 5,
  },
  colorText: {
    fontSize: 12,
    color: '#333',
  },
});

export default ScheduleModal;
